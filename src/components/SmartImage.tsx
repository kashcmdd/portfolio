import React, { useState } from 'react';

/**
 * An <img> with the loading, decoding and scaling attributes left on, plus a
 * placeholder that disappears once the bytes arrive.
 *
 * Two separate problems are solved here.
 *
 * Layout shift: an image with no intrinsic size is invisible when the layout is
 * built and then pushes everything down when it loads. Every call site already
 * pins its box with an aspect-ratio class, and `width`/`height` here give the
 * browser the same ratio up front so it does not have to wait for the file.
 *
 * Perceived speed: a card that is simply blank for a moment reads as broken,
 * while a card with a soft shimmer in the right shape reads as loading. The
 * placeholder is sized by the same box as the image, so nothing moves when the
 * swap happens.
 *
 * The parent must be `relative` and must clip overflow, or the placeholder will
 * escape the card. Every call site already is.
 */

/**
 * Every image is a local file under public/. They ship at one resolution each,
 * so they get a plain src rather than a srcset of identical files. The square
 * journal thumbnails exist for the one place that would otherwise download a
 * 1200px banner for a 56px circle.
 */
interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Intrinsic ratio, as "w / h". Used for width/height and the empty box. */
  ratio?: string;
  /** True for the image a visitor is waiting on, e.g. the hero or a modal banner. */
  priority?: boolean;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  ratio = '16 / 9',
  priority = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [w, h] = ratio.split('/').map((part) => Number(part.trim())) as [number, number];

  return (
    <>
      <img
        src={src}
        alt={alt}
        width={Number.isFinite(w) ? w : undefined}
        height={Number.isFinite(h) ? h : undefined}
        // A hero image that waits for a scroll-triggered load is the classic
        // cause of a slow Largest Contentful Paint.
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />
      {!loaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0 skeleton-shimmer bg-white/[0.04]"
        />
      )}
    </>
  );
};
