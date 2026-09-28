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

const SRCSET_WIDTHS = [400, 640, 900, 1400];

/**
 * The exploration and journal banners come from Unsplash, which already serves
 * AVIF or WebP through `auto=format` and can resize on the fly with `&w=`.
 * Building a srcset from that is nearly free. The local .webp files in public/
 * exist at one resolution each, so those get a plain src and are not faked into
 * a srcset of identical images.
 */
const buildSrcSet = (src: string): string | undefined => {
  if (!src.includes('images.unsplash.com')) return undefined;
  if (!/[?&]w=\d+/.test(src)) return undefined;
  return SRCSET_WIDTHS.map((width) => {
    const sized = src.replace(/([?&])w=\d+/, `$1w=${width}`);
    return `${sized} ${width}w`;
  }).join(', ');
};

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Intrinsic ratio, as "w / h". Used for width/height and the empty box. */
  ratio?: string;
  /** True for the image a visitor is waiting on, e.g. the hero or a modal banner. */
  priority?: boolean;
  /** Tells the browser what the rendered width will be, so it can pick a source. */
  sizes?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  ratio = '16 / 9',
  priority = false,
  sizes,
}) => {
  const [loaded, setLoaded] = useState(false);
  const srcSet = buildSrcSet(src);
  const [w, h] = ratio.split('/').map((part) => Number(part.trim())) as [number, number];

  return (
    <>
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
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
