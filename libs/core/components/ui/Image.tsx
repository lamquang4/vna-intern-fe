import NextImage, { type ImageProps } from "next/image";

export function Image({ alt, src, unoptimized, ...props }: ImageProps) {
  const isSvg = typeof src === "string" && src.toLowerCase().endsWith(".svg");

  return (
    <NextImage
      src={src}
      alt={alt}
      unoptimized={unoptimized ?? isSvg}
      {...props}
    />
  );
}
