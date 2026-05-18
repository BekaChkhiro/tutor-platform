'use client';

import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { requestUploadUrl, finalizePhoto } from '@/server/actions/storage/photo';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_DIMENSION = 400;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onSuccess?: (photoUrl: string) => void;
  className?: string;
}

type Stage = 'idle' | 'crop' | 'uploading' | 'done';

async function getCroppedBlob(imageSrc: string, cropPx: Area, contentType: string): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = cropPx.width;
  canvas.height = cropPx.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(image, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, cropPx.width, cropPx.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))), contentType, 0.95);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = src;
  });
}

function validateImageDimensions(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.naturalWidth < MIN_DIMENSION || img.naturalHeight < MIN_DIMENSION) {
        resolve(`Image must be at least ${MIN_DIMENSION}×${MIN_DIMENSION}px`);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('Could not read image dimensions');
    };
    img.src = url;
  });
}

export function PhotoUpload({ currentPhotoUrl, onSuccess, className }: PhotoUploadProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>('image/jpeg');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPx, setCroppedAreaPx] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl ?? null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPx(areaPixels);
  }, []);

  async function handleFile(file: File) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 10 MB.');
      return;
    }

    const dimError = await validateImageDimensions(file);
    if (dimError) {
      setError(dimError);
      return;
    }

    const url = URL.createObjectURL(file);
    setContentType(file.type);
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setStage('crop');
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragRef.current?.removeAttribute('data-drag');
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleConfirmCrop() {
    if (!imageSrc || !croppedAreaPx) return;
    setStage('uploading');
    setProgress(10);

    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPx, contentType);

      setProgress(20);

      const urlResult = await requestUploadUrl(contentType);
      if (!urlResult.success) {
        setError(urlResult.error);
        setStage('crop');
        return;
      }

      setProgress(30);

      const { uploadUrl, key } = urlResult.data;

      // Direct PUT to R2
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });

      if (!putRes.ok) {
        setError('Upload to storage failed. Please try again.');
        setStage('crop');
        return;
      }

      setProgress(70);

      const finalResult = await finalizePhoto(key);
      if (!finalResult.success) {
        setError(finalResult.error);
        setStage('crop');
        return;
      }

      setProgress(100);
      setPreviewUrl(finalResult.data.photoUrl);
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
      setStage('done');
      onSuccess?.(finalResult.data.photoUrl);
    } catch {
      setError('Something went wrong. Please try again.');
      setStage('crop');
    }
  }

  function handleCancel() {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setStage('idle');
    setError(null);
  }

  return (
    <div className={cn('space-y-3', className)}>
      {stage === 'crop' && imageSrc ? (
        <div className="space-y-3">
          <div className="relative h-64 w-full overflow-hidden rounded-xl bg-black">
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

          <div className="space-y-1">
            <label className="text-muted-foreground text-xs">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleConfirmCrop} className="flex-1">
              Use this photo
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      ) : stage === 'uploading' ? (
        <div className="space-y-2">
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted-foreground text-center text-sm">Uploading photo…</p>
        </div>
      ) : (
        <div
          ref={dragRef}
          className="border-border data-[drag]:border-primary data-[drag]:bg-primary/5 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            dragRef.current?.setAttribute('data-drag', '');
          }}
          onDragLeave={() => dragRef.current?.removeAttribute('data-drag')}
          onDrop={onDrop}
        >
          {previewUrl ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-full">
              <Image src={previewUrl} alt="Profile photo" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
              <svg
                className="text-muted-foreground h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-medium">
              {previewUrl ? 'Change photo' : 'Upload profile photo'}
            </p>
            <p className="text-muted-foreground text-xs">
              Drag & drop or click — JPEG, PNG, WebP · max 10 MB · min {MIN_DIMENSION}×{MIN_DIMENSION}px
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="sr-only"
            onChange={onInputChange}
          />
        </div>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
