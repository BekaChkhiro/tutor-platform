'use client';

import { useRef, useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

export function VideoPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  function handleMouseEnter() {
    if (ref.current && !playing) {
      ref.current.muted = true;
      setMuted(true);
      ref.current.play().catch(() => null);
      setPlaying(true);
    }
  }

  function handleMouseLeave() {
    if (ref.current) {
      ref.current.pause();
      ref.current.currentTime = 0;
      setPlaying(false);
    }
  }

  function toggleMute() {
    if (!ref.current) return;
    const next = !ref.current.muted;
    ref.current.muted = next;
    setMuted(next);
    if (!playing) {
      ref.current.play().catch(() => null);
      setPlaying(true);
    }
  }

  return (
    <div
      className="rounded-card relative aspect-video w-full cursor-pointer overflow-hidden bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={toggleMute}
    >
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        loop
        className="h-full w-full object-cover"
        aria-label="Tutor intro video"
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="size-6 translate-x-0.5 text-neutral-900" aria-hidden />
          </div>
        </div>
      )}
      {playing && (
        <button
          className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          aria-label={muted ? 'Enable sound' : 'Mute'}
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      )}
    </div>
  );
}
