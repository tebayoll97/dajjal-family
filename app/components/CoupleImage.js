import Image from "next/image";

const DEFAULT_SIZES = "(max-width: 768px) 100vw, 50vw";

/**
 * Shared optimized image renderer for Couple experiences.
 * Google Drive File IDs are immutable per upload, so replacing an image
 * produces a new source URL and a distinct Next/Vercel image-cache key.
 */
export default function CoupleImage({
  src,
  alt,
  width = 1600,
  height = 2000,
  sizes = DEFAULT_SIZES,
  loading = "lazy",
  fetchPriority,
  className,
  style,
  draggable,
  quality = 75,
}) {
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt || ""}
      width={width}
      height={height}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
      style={style}
      draggable={draggable}
      quality={quality}
      unoptimized
    />
  );
}
