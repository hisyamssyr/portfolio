"use client";

import { useEffect, useRef, useState } from "react";
import { onFrame } from "@/lib/raf";

const labels: Record<string, string> = {
  open: "OPEN",
  drag: "DRAG",
  run: "RUN",
  view: "VIEW",
};

export default function Cursor() {
  const dot = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const followers = useRef<Array<HTMLDivElement | null>>([]);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { ...target };
    const ringPos = { ...target };
    const trail = [
      { x: target.x, y: target.y },
      { x: target.x, y: target.y },
      { x: target.x, y: target.y },
    ];
    let inside = false;
    let pressed = false;

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
    };
    const onDown = () => {
      pressed = true;
      ring.current?.classList.add("is-pressed");
    };
    const onUp = () => {
      pressed = false;
      ring.current?.classList.remove("is-pressed");
    };
    const onOver = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest?.("[data-cursor]");
      if (el) {
        setLabel(labels[el.getAttribute("data-cursor") ?? ""] ?? null);
      } else {
        setLabel(null);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    const unsubscribe = onFrame(() => {
      dotPos.x += (target.x - dotPos.x) * 0.42;
      dotPos.y += (target.y - dotPos.y) * 0.42;
      ringPos.x += (target.x - ringPos.x) * 0.24;
      ringPos.y += (target.y - ringPos.y) * 0.24;
      trail.forEach((point, index) => {
        const targetPoint = index === 0 ? dotPos : trail[index - 1];
        point.x += (targetPoint.x - point.x) * (0.2 - index * 0.04);
        point.y += (targetPoint.y - point.y) * (0.2 - index * 0.04);
      });
      const opacity = inside ? "1" : "0";
      if (dot.current) {
        dot.current.style.opacity = opacity;
        dot.current.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) scale(${pressed ? 0.7 : 1})`;
      }
      if (ring.current) {
        ring.current.style.opacity = opacity;
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      }
      const goo = document.querySelector<HTMLElement>(".cursor-goo");
      if (goo) {
        goo.style.opacity = opacity;
        goo.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      }
      trail.forEach((point, index) => {
        const node = followers.current[index];
        if (!node) return;
        const offsetX = Math.max(-82, Math.min(82, point.x - ringPos.x));
        const offsetY = Math.max(-82, Math.min(82, point.y - ringPos.y));
        node.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      });
    });

    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      unsubscribe();
    };
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div className="cursor-goo">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            ref={(node) => {
              followers.current[index] = node;
            }}
            className="cursor-follower"
          />
        ))}
      </div>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className={`cursor-ring${label ? " is-active" : ""}`}>
        <span ref={labelRef} className="cursor-label">
          {label}
        </span>
      </div>
    </div>
  );
}
