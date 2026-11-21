"use client";

import { motion } from "motion/react";
import { Expand } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState, type RefObject } from "react";
import { getPhoto, type PhotoRef } from "@/content";
import { cx } from "@/lib/cx";
import { useReducedMotion } from "@/lib/hooks";
import { Photo } from "./Photo";

const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

type GalleryProps = {
  slots: PhotoRef[];
  className?: string;
  coverRef?: RefObject<HTMLDivElement | null>;
  label?: string;
};

export default function Gallery({
  slots,
  className,
  coverRef,
  label = "Photo stack",
}: GalleryProps) {
  const reduced = useReducedMotion();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [fanned, setFanned] = useState(false);
  const dragged = useRef(false);

  return (
    <div className={cx("gallery", className)}>
      <div className={cx("photo-stack", fanned && "is-fanned")} role="group" aria-label={label}>
        <div className="photo-stack__halo" aria-hidden="true" />
        {slots.map((slot, index) => {
          const photo = getPhoto(slot);
          return (
            <motion.button
              key={slot}
              type="button"
              className={`photo-stack__card photo-stack__card--${index}`}
              aria-label={`Open ${photo.alt || photo.id} in the photo viewer`}
              drag={!reduced}
              dragSnapToOrigin
              dragElastic={0.42}
              dragMomentum
              whileDrag={{ scale: 1.03, zIndex: 20 }}
              onDragStart={() => {
                dragged.current = true;
              }}
              onDragEnd={() => {
                window.setTimeout(() => {
                  dragged.current = false;
                }, 60);
              }}
              onClick={() => {
                if (dragged.current) return;
                setLightbox(index);
              }}
              onPointerDown={() => {
                dragged.current = false;
              }}
              style={{ touchAction: "none" }}
            >
              <div className="photo-stack__frame" ref={index === 0 ? coverRef : undefined}>
                <Photo
                  slot={slot}
                  sizes="(max-width: 640px) 72vw, 360px"
                  className="photo-stack__photo"
                />
              </div>
              <span className="photo-stack__index mono" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="gallery__bar">
        <span className="mono">{slots.length} PHOTOS</span>
        <button
          type="button"
          className="gallery__spread mono"
          onClick={() => setFanned((value) => !value)}
          aria-pressed={fanned}
        >
          <Expand size={13} strokeWidth={1.7} aria-hidden="true" />
          {fanned ? "STACK" : "SPREAD"}
        </button>
      </div>
      {lightbox !== null && (
        <Lightbox
          slots={slots}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
        />
      )}
    </div>
  );
}
