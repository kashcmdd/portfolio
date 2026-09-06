import React, { useRef, useEffect } from 'react';

export interface VideoOption {
  id: string;
  label: string;
  url: string;
}

export const VIDEO_SOURCES: VideoOption[] = [
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
  },
  {
    id: 'still-water',
    label: 'Still Water',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
  },
  {
    id: 'deep-woods',
    label: 'Deep Woods',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
  },
  {
    id: 'quiet-dawn',
    label: 'Quiet Dawn',
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

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#121820] via-[#0a0a0a] to-[#0f141c] z-0" />

      {VIDEO_SOURCES.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <video
            key={item.id}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={item.url}
            autoPlay={isActive}
            muted
            loop
            playsInline
            preload={isActive ? 'auto' : 'metadata'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out transform-gpu ${
              isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
            style={{
              willChange: 'opacity',
              transform: 'translate3d(0,0,0)',
            }}
          />
        );
      })}

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
