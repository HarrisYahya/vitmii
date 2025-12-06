"use client";

import Image, { ImageProps } from "next/image";

export default function SafeImage(props: ImageProps) {
  const src =
    typeof props.src === "string" && props.src.length > 0
      ? props.src
      : "/placeholder.png"; // optional fallback

  const isExternal = src.startsWith("http");

  return (
    <Image
      {...props}
      src={src}
      unoptimized={isExternal} // ✅ THIS IS THE PERMANENT FIX
    />
  );
}
 