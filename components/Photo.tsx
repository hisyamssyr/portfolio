"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { getPhoto, site, type PhotoRef } from "@/content";
import { cx } from "@/lib/cx";
import { usePhotoAvailable } from "./providers";

type PhotoProps = {
  slot: PhotoRef;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  quiet?: boolean;
  altOverride?: string;
  placeholderVariant?: "default" | "portrait";
};

export function Photo({
  slot,
  sizes = "(max-width: 640px) 92vw, (max-width: 1024px) 55vw, 40vw",
  priority = false,
  className,
  imgClassName,
  quiet = false,
  altOverride,
  placeholderVariant = "default",
}: PhotoProps) {
  const photo = getPhoto(slot);
  const available = usePhotoAvailable(slot);
  const [loaded, setLoaded] = useState(false);
  const treatment = site.imageTreatment;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !photo.alt && !altOverride) {
      console.warn(
        `[photo] Missing alt text for "${photo.id}" in content.ts (${photo.file})`,
      );
    }
  }, [photo.alt, photo.id, photo.file, altOverride]);

  const style = {
    ["--photo-ratio" as string]: `${photo.width} / ${photo.height}`,
  };

  if (!available) {
    return (
      <div
        className={cx(
          "photo",
          "photo--placeholder",
          placeholderVariant === "portrait" && "photo--portrait",
          className,
        )}
        style={style}
        role="img"
        aria-label={`Photo placeholder for ${photo.alt || photo.id}. Add ${photo.file}, ${photo.width}x${photo.height}, ${photo.ratio}.`}
      >
        <span className="photo__crop photo__crop--tl" aria-hidden="true" />
        <span className="photo__crop photo__crop--tr" aria-hidden="true" />
        <span className="photo__crop photo__crop--bl" aria-hidden="true" />
        <span className="photo__crop photo__crop--br" aria-hidden="true" />
        <span className="photo__dither" aria-hidden="true" />
        <span className="photo__camera" aria-hidden="true">
          <Camera size={18} strokeWidth={1.4} />
        </span>
        {!quiet && (
          <span className="photo__spec">
            <span className="photo__spec-line">
              PHOTO · {photo.ratio} · {photo.width}x{photo.height}
            </span>
            <span className="photo__spec-path">{photo.file}</span>
            <span className="photo__spec-hint">{photo.hint}</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cx(
        "photo",
        treatment === "graded" && "photo--graded",
        loaded && "is-loaded",
        className,
      )}
      style={style}
    >
      <span className="photo__dither photo__dither--loading" aria-hidden="true" />
      <Image
        src={photo.src}
        alt={altOverride ?? photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={82}
        className={cx("photo__img", imgClassName)}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
