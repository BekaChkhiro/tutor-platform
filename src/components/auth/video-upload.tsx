'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  requestVideoUploadUrl,
  requestPosterUploadUrl,
  finalizeIntroVideo,
  deleteIntroVideo,
} from '@/server/actions/storage/video';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_DURATION_S = 60;
const ALLOWED_TYPES = ['video/mp4', 'video/webm'];

interface VideoUploadProps {
  currentVideoUrl?: string | null;
  currentPosterUrl?: string | null;
  onUploaded?: (videoUrl: string, posterUrl: string | null) => void;
  onDeleted?: () => void;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error('Could not read video metadata'));
    video.src = URL.createObjectURL(file);
  });
}

function extractPosterBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    video.preload = 'metadata';
    video.muted = true;
    video.onloadedmetadata = () => {
      video.currentTime = 0.1;
    };
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unavailable'));
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(video.src);
          if (blob) resolve(blob);
          else reject(new Error('Canvas is empty'));
        },
        'image/jpeg',
        0.85,
      );
    };
    video.onerror = () => reject(new Error('Could not load video for poster extraction'));
    video.src = URL.createObjectURL(file);
  });
}

type Phase = 'idle' | 'uploading' | 'done' | 'deleting' | 'error';

export function VideoUpload({
  currentVideoUrl,
  currentPosterUrl,
  onUploaded,
  onDeleted,
}: VideoUploadProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(currentVideoUrl ?? null);
  const [posterUrl, setPosterUrl] = useState<string | null>(currentPosterUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Only MP4 and WebM videos are allowed.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size is 50 MB.');
        return;
      }

      let duration: number;
      try {
        duration = await getVideoDuration(file);
      } catch {
        setError('Could not read video duration. Please try a different file.');
        return;
      }
      if (!isFinite(duration) || duration > MAX_DURATION_S) {
        setError(`Video must be ${MAX_DURATION_S} seconds or shorter.`);
        return;
      }

      setPhase('uploading');
      setProgress(0);

      try {
        // Request presigned URL for the video.
        const videoUrlResult = await requestVideoUploadUrl(file.type);
        if (!videoUrlResult.success) {
          setError(videoUrlResult.error);
          setPhase('error');
          return;
        }

        // Upload video with progress tracking.
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', videoUrlResult.data.uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 75));
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve()
              : reject(new Error(`Upload failed: ${xhr.status}`));
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send(file);
        });

        setProgress(80);

        // Extract and upload poster (best-effort — failures are non-blocking).
        try {
          const posterBlob = await extractPosterBlob(file);
          const posterResult = await requestPosterUploadUrl();
          if (posterResult.success) {
            await fetch(posterResult.data.uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'image/jpeg' },
              body: posterBlob,
            });
          }
        } catch {
          // Poster failure is non-fatal.
        }

        setProgress(90);
        const finalResult = await finalizeIntroVideo();
        if (!finalResult.success) {
          setError(finalResult.error);
          setPhase('error');
          return;
        }

        setProgress(100);
        setVideoUrl(finalResult.data.introVideoUrl);
        setPosterUrl(finalResult.data.posterUrl);
        setPhase('done');
        onUploaded?.(finalResult.data.introVideoUrl, finalResult.data.posterUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        setPhase('error');
      }
    },
    [onUploaded],
  );

  const handleFileDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) await handleFile(file);
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) await handleFile(file);
      e.target.value = '';
    },
    [handleFile],
  );

  const handleDelete = useCallback(async () => {
    setError(null);
    setPhase('deleting');
    const result = await deleteIntroVideo();
    if (!result.success) {
      setError(result.error);
      setPhase('error');
      return;
    }
    setVideoUrl(null);
    setPosterUrl(null);
    setPhase('idle');
    onDeleted?.();
  }, [onDeleted]);

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
    setPhase('idle');
  }, []);

  if (phase === 'uploading') {
    return (
      <div className="space-y-3 rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm font-medium">Uploading…</p>
        <div className="bg-border h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-muted-foreground text-xs">{progress}%</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videoUrl && (
        <div className="space-y-2">
          <video
            src={videoUrl}
            poster={posterUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-xl"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={phase === 'deleting'}
          >
            {phase === 'deleting' ? 'Removing…' : 'Remove video'}
          </Button>
        </div>
      )}

      {(phase === 'error' || error) && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
          <span>{error}</span>
          <button type="button" onClick={reset} className="ml-2 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => inputRef.current?.click()}
        className="border-border hover:border-ring hover:bg-muted/30 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload intro video"
      >
        <p className="text-sm font-medium">
          {videoUrl ? 'Replace intro video' : 'Upload an intro video'}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Drag & drop or click to browse · MP4 / WebM · max 60 s · max 50 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
