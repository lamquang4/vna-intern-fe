import type { ComponentPropsWithoutRef } from "react";

/* eslint-disable @next/next/no-img-element */

type ImageSource = string | { src: string };

type Props = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src: ImageSource;
};

export function Image({ alt, src, ...props }: Props) {
  return (
    <img src={typeof src === "string" ? src : src.src} alt={alt} {...props} />
  );
}
