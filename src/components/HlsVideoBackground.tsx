import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

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
    if (!isVisible) return;

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (hlsSource && Hls.isSupported()) {
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
        if (data.fatal && fallbackSource && video) {
          video.src = fallbackSource;
          video.play().catch(() => {});
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && hlsSource) {
      video.src = hlsSource;
      video.play().catch(() => {});
    } else if (fallbackSource) {
      video.src = fallbackSource;
      video.play().catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [isVisible, hlsSource, fallbackSource]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
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
    </div>
  );
};
