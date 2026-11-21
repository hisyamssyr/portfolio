"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { getPhoto, type PhotoRef } from "@/content";
import { cx } from "@/lib/cx";
import { useBodyLock, useFocusTrap, useReducedMotion } from "@/lib/hooks";
import { Photo } from "./Photo";
import { usePhotoMap } from "./providers";

type LightboxProps = {
  slots: PhotoRef[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export default function Lightbox({
  slots,
  index,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const reduced = useReducedMotion();
  const photos = usePhotoMap();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const slot = getPhoto(slots[index]);

  useBodyLock(true);
  useFocusTrap(panelRef as RefObject<HTMLElement | null>, true, onClose);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const next = useCallback(() => {
    onIndexChange((index + 1) % slots.length);
  }, [index, onIndexChange, slots.length]);

  const previous = useCallback(() => {
    onIndexChange((index - 1 + slots.length) % slots.length);
  }, [index, onIndexChange, slots.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, previous]);

  useEffect(() => {
    [index - 1, index + 1].forEach((neighbor) => {
      const wrapped = (neighbor + slots.length) % slots.length;
      const id = slots[wrapped];
      if (!photos[id]) return;
      const image = new window.Image();
      image.src = getPhoto(id).src;
    });
  }, [index, photos, slots]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`Photo viewer: ${slot.alt || slot.id}`}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.24 }}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div ref={panelRef} className="lightbox__panel">
          <div className="lightbox__top mono">
            <span>
              {String(index + 1).padStart(2, "0")} / {String(slots.length).padStart(2, "0")}
            </span>
            <span>
              {slot.ratio} · {slot.width}x{slot.height}
            </span>
            <button
              type="button"
              className="lightbox__close glass glass--pill"
              onClick={onClose}
              aria-label="Close photo viewer"
            >
              <X size={18} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>

          <motion.div
            className="lightbox__stage"
            drag={!reduced}
            dragSnapToOrigin
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) {
                onClose();
                return;
              }
              if (info.offset.x < -80) next();
              if (info.offset.x > 80) previous();
            }}
          >
            <AnimatePresence mode="wait">
              <motion.figure
                key={slots[index]}
                className="lightbox__figure"
                initial={reduced ? false : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
              >
                <div className="lightbox__image-wrap">
                  <Photo
                    slot={slots[index]}
                    sizes="(max-width: 900px) 92vw, 82vw"
                    className="lightbox__photo"
                    priority
                  />
                </div>
                {slot.caption ? (
                  <figcaption className="lightbox__caption mono">{slot.caption}</figcaption>
                ) : null}
              </motion.figure>
            </AnimatePresence>
          </motion.div>

          <div className="lightbox__controls">
            <button
              type="button"
              className="lightbox__arrow glass"
              onClick={previous}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <div className="lightbox__thumbs" role="list">
              {slots.map((id, thumbIndex) => (
                <button
                  key={id}
                  type="button"
                  className={cx(
                    "lightbox__thumb",
                    thumbIndex === index && "is-active",
                  )}
                  onClick={() => onIndexChange(thumbIndex)}
                  aria-label={`View ${getPhoto(id).alt || getPhoto(id).id}`}
                  aria-current={thumbIndex === index ? "true" : undefined}
                >
                  <Photo
                    slot={id}
                    sizes="84px"
                    className="lightbox__thumb-photo"
                    quiet
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="lightbox__arrow glass"
              onClick={next}
              aria-label="Next photo"
            >
              <ChevronRight size={22} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
