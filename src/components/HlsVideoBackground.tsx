import React, { useEffect, useRef, useState } from 'react';
import type HlsType from 'hls.js';
import { useMotionPref } from './MotionPrefProvider';

interface HlsVideoBackgroundProps {
  hlsSource?: string;
  fallbackSource?: string;
  className?: string;
  style?: React.CSSProperties;
  flipVertical?: boolean;
}

export const HlsVideoBackground: React.FC<HlsVideoBackgroundProps> = ({
  hlsSource = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
  fallbackSource = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4',
  className = '',
  style,
  flipVertical = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { reduced } = useMotionPref();

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Reduced motion: never start the stream. The footer keeps its own backdrop,
    // and pulling 580 kB of HLS to play a clip the visitor asked not to see is
    // exactly the waste this component was written to avoid elsewhere.
    if (!isVisible || reduced) return;

    const video = videoRef.current;
    if (!video) return;

    let hls: HlsType | null = null;
    let cancelled = false;

    const playFallback = () => {
      if (!fallbackSource) return;
      video.src = fallbackSource;
      video.play().catch(() => {});
    };

    // Safari plays HLS natively, so there is no reason to pull in the parser.
    if (video.canPlayType('application/vnd.apple.mpegurl') && hlsSource) {
      video.src = hlsSource;
      video.play().catch(() => {});
      return;
    }

    void (async () => {
      try {
        const { default: Hls } = await import('hls.js');
        if (cancelled) return;

        if (!hlsSource || !Hls.isSupported()) {
          playFallback();
          return;
        }

        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(hlsSource);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            playFallback();
          }
        });
      } catch {
        if (!cancelled) playFallback();
      }
    })();

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
      }
    };
  }, [isVisible, hlsSource, fallbackSource, reduced]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {!reduced && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute min-w-full min-h-full object-cover pointer-events-none transform-gpu ${
            flipVertical ? 'scale-y-[-1]' : ''
          } ${className}`}
          style={style}
        />
      )}
    </div>
  );
};
