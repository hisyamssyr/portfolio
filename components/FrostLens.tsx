"use client";

import { useEffect, useRef, useState } from "react";

type LensState = { x: number; y: number; closing: boolean } | null;

export default function FrostLens() {
  const [lens, setLens] = useState<LensState>(null);
  const state = useRef({
    timer: 0,
    active: false,
    startX: 0,
    startY: 0,
    closeTimer: 0,
  });

  useEffect(() => {
    const clear = () => {
      window.clearTimeout(state.current.timer);
      window.clearTimeout(state.current.closeTimer);
    };

    const begin = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(".lightbox, .palette, .scene")) return;
      state.current.startX = event.clientX;
      state.current.startY = event.clientY;
      clear();
      state.current.timer = window.setTimeout(
        () => {
          state.current.active = true;
          setLens({ x: event.clientX, y: event.clientY, closing: false });
        },
        event.pointerType === "touch" ? 460 : 330,
      );
    };

    const move = (event: PointerEvent) => {
      if (state.current.active) {
        setLens((current) =>
          current ? { ...current, x: event.clientX, y: event.clientY } : current,
        );
        return;
      }
      const distance = Math.hypot(
        event.clientX - state.current.startX,
        event.clientY - state.current.startY,
      );
      if (distance > 14) {
        window.clearTimeout(state.current.timer);
      }
    };

    const end = () => {
      window.clearTimeout(state.current.timer);
      if (!state.current.active) return;
      state.current.active = false;
      setLens((current) => (current ? { ...current, closing: true } : current));
      state.current.closeTimer = window.setTimeout(() => setLens(null), 280);
    };

    const blockContext = (event: Event) => {
      if (state.current.active) event.preventDefault();
    };

    window.addEventListener("pointerdown", begin, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", end, { passive: true });
    window.addEventListener("pointercancel", end, { passive: true });
    window.addEventListener("contextmenu", blockContext);
    window.addEventListener("blur", end);

    return () => {
      clear();
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("contextmenu", blockContext);
      window.removeEventListener("blur", end);
    };
  }, []);

  if (!lens) return null;
  return (
    <div
      className={`frost-lens${lens.closing ? " is-closing" : ""}`}
      style={{ left: lens.x, top: lens.y }}
      aria-hidden="true"
    />
  );
}
