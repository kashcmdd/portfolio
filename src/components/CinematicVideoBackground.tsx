import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMotionPref } from './MotionPrefProvider';

export interface VideoOption {
  id: string;
  label: string;
  url: string;
}

export const VIDEO_SOURCES: VideoOption[] = [
  {
    id: 'golden-hour',
    label: 'Witching Hour',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
  },
  {
    id: 'still-water',
    label: 'Black Water',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
  },
  {
    id: 'deep-woods',
    label: 'Deep Woods',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
  },
  {
    id: 'quiet-dawn',
    label: 'Blood Moon',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4',
  },
];

interface CinematicVideoBackgroundProps {
  activeIndex: number;
  showOverlayImage?: boolean;
}

export const CinematicVideoBackground: React.FC<CinematicVideoBackgroundProps> = ({
  activeIndex,
  showOverlayImage = true,
}) => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set());
  const [hasActiveVideo, setHasActiveVideo] = useState(true);
  const { reduced } = useMotionPref();

  const handleVideoError = useCallback((index: number) => {
    console.warn(`Video ${VIDEO_SOURCES[index].label} failed to load`);
    setVideoErrors(prev => new Set(prev).add(index));
    
    // Check if the active video failed
    if (index === activeIndex) {
      setHasActiveVideo(false);
    }
  }, [activeIndex]);

  const handleVideoLoad = useCallback((index: number) => {
    setVideoErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    
    // If this is the active video and it loaded successfully
    if (index === activeIndex) {
      setHasActiveVideo(true);
    }
  }, [activeIndex]);

  useEffect(() => {
    if (reduced) return;
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn(`Video play failed for ${VIDEO_SOURCES[index].label}:`, error);
            handleVideoError(index);
          });
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, [activeIndex, handleVideoError, reduced]);

  // Only the active clip and the one after it are given a source. Four <video>
  // elements all pointing at remote files meant four requests on first paint for
  // one visible background; the other two now wait until they are about to be
  // shown. The next clip still preloads so the cross-fade stays smooth.
  const nextIndex = (activeIndex + 1) % VIDEO_SOURCES.length;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-[#0a0a0a]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#121820] via-[#0a0a0a] to-[#0f141c] z-0" />

      {/* Under reduced motion the videos are not rendered at all; the gradient
          and the overlay below carry the hero on their own, and a still frame
          is exactly what the preference is asking for. */}
      {!reduced && VIDEO_SOURCES.map((item, index) => {
        const isActive = activeIndex === index;
        const hasError = videoErrors.has(index);
        const isNext = index === nextIndex;
        
        return (
          <video
            key={item.id}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={isActive || isNext ? item.url : undefined}
            autoPlay={isActive && !hasError}
            muted
            loop
            playsInline
            preload={isActive ? 'auto' : 'metadata'}
            onError={() => handleVideoError(index)}
            onLoadedData={() => handleVideoLoad(index)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out transform-gpu halloween-video ${
              isActive && !hasError ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
            style={{
              willChange: 'opacity',
              transform: 'translate3d(0,0,0)',
            }}
          />
        );
      })}

      {/* Fallback gradient when videos fail */}
      {!hasActiveVideo && (
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#FF8C42]/20 via-[#B23A0F]/10 to-[#0a0a0a] animate-pulse" />
      )}

      {showOverlayImage && (
        <div
          className="absolute inset-0 z-[2] w-full h-full bg-cover bg-center pointer-events-none animate-train-bob opacity-60 mix-blend-screen transform-gpu"
          style={{
            backgroundImage: `url('https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png')`,
          }}
        />
      )}

      <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/80 via-black/30 to-black/50 pointer-events-none" />
    </div>
  );
};
