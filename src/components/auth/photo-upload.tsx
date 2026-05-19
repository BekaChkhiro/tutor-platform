'use client';

import { useState, useCallback, useRef } from 'react';
import NextImage from 'next/image';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { requestUploadUrl, finalizePhoto } from '@/server/actions/storage/photo';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_DIMENSION = 400;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onUploaded?: (photoUrl: string) => void;
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = src;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas is empty'))),
      'image/jpeg',
      0.92,
    );
  });
}

type Phase = 'idle' | 'crop' | 'uploading' | 'done' | 'error';

export function PhotoUpload({ currentPhotoUrl, onUploaded }: PhotoUploadProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndLoad = useCallback(async (file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }
    const src = URL.createObjectURL(file);
    const img = await createImage(src);
    if (img.naturalWidth < MIN_DIMENSION || img.naturalHeight < MIN_DIMENSION) {
      URL.revokeObjectURL(src);
      setError(`Image must be at least ${MIN_DIMENSION}×${MIN_DIMENSION} pixels.`);
      return;
    }
    setImageSrc(src);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPhase('crop');
  }, []);

  const handleFileDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) await validateAndLoad(file);
    },
    [validateAndLoad],
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) await validateAndLoad(file);
      e.target.value = '';
    },
    [validateAndLoad],
  );

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setError(null);
    setPhase('uploading');
    setProgress(0);

    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);

      const urlResult = await requestUploadUrl('image/jpeg');
      if (!urlResult.success) {
        setError(urlResult.error);
        setPhase('error');
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', urlResult.data.uploadUrl);
        xhr.setRequestHeader('Content-Type', 'image/jpeg');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(blob);
      });

      setProgress(95);
      const finalResult = await finalizePhoto();
      if (!finalResult.success) {
        setError(finalResult.error);
        setPhase('error');
        return;
      }

      setProgress(100);
      setPreviewUrl(finalResult.data.photoUrl);
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
      setPhase('done');
      onUploaded?.(finalResult.data.photoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setPhase('error');
    }
  }, [imageSrc, croppedAreaPixels, onUploaded]);

  const reset = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setError(null);
    setProgress(0);
    setPhase('idle');
  }, [imageSrc]);

  if (phase === 'crop' && imageSrc) {
    return (
      <div className="space-y-4">
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-current"
          />
        </div>
        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={reset}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload}>
            Use this photo
          </Button>
        </div>
      </div>
    );
  }

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
      {previewUrl && (
        <div className="flex justify-center">
          <NextImage
            src={previewUrl}
            alt="Profile photo"
            width={96}
            height={96}
            unoptimized={previewUrl.startsWith('blob:')}
            className="ring-ring h-24 w-24 rounded-full object-cover ring-2 ring-offset-2"
          />
        </div>
      )}

      {(phase === 'error' || error) && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => inputRef.current?.click()}
        className="border-border hover:border-ring hover:bg-muted/30 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload profile photo"
      >
        <p className="text-sm font-medium">
          {previewUrl ? 'Replace photo' : 'Upload a profile photo'}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Drag & drop or click to browse · JPEG / PNG / WebP · min 400×400 · max 10 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
