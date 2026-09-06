import React, { useEffect, useRef } from 'react';

interface FadingVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

export const FadingVideo: React.FC<FadingVideoProps> = ({ src, className = '', style }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);

  const fadeTo = (targetOpacity: number, duration: number = FADE_MS) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    const startOpacity = parseFloat(video.style.opacity) || 0;
    const opacityDelta = targetOpacity - startOpacity;

    if (Math.abs(opacityDelta) < 0.001) {
      video.style.opacity = targetOpacity.toString();
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = startOpacity + opacityDelta * progress;

      if (videoRef.current) {
        videoRef.current.style.opacity = currentOpacity.toFixed(3);
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial opacity to 0 via style
    video.style.opacity = '0';

    const handleLoadedData = () => {
      const v = videoRef.current;
      if (!v) return;
      v.style.opacity = '0';
      v.play().catch(() => {});
      fadeTo(1, FADE_MS);
    };

    const handleTimeUpdate = () => {
      const v = videoRef.current;
      if (!v) return;

      const duration = v.duration;
      const currentTime = v.currentTime;

      if (
        !fadingOutRef.current &&
        duration > 0 &&
        duration - currentTime <= FADE_OUT_LEAD &&
        duration - currentTime > 0
      ) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };

    const handleEnded = () => {
      const v = videoRef.current;
      if (!v) return;

      v.style.opacity = '0';
      setTimeout(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;
        videoEl.currentTime = 0;
        fadingOutRef.current = false;
        videoEl.play().catch(() => {});
        fadeTo(1, FADE_MS);
      }, 100);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    // If video is already loaded
    if (video.readyState >= 2) {
      handleLoadedData();
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{
        ...style,
        opacity: 0, // initially 0 before custom rAF crossfade
      }}
    />
  );
};
