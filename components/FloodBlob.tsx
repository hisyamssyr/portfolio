"use client";

import { useEffect, useRef } from "react";
import { onFrame } from "@/lib/raf";

const from =
  "M 100 24 C 132 24 166 46 176 82 C 186 118 170 158 140 174 C 110 190 64 180 42 154 C 20 128 22 88 40 62 C 58 36 76 24 100 24 Z";
const to =
  "M 102 18 C 146 22 180 54 178 96 C 176 138 146 176 104 182 C 62 188 24 158 22 116 C 20 74 44 36 78 24 C 86 21 94 17 102 18 Z";

export default function FloodBlob({ x, y }: { x: number; y: number }) {
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    const start = performance.now();
    void import("flubber").then(({ interpolate }) => {
      if (cancelled) return;
      const morph = interpolate(from, to, { maxSegmentLength: 5 });
      unsubscribe = onFrame((time) => {
        const progress = Math.min(1, (time - start) / 620);
        const eased = 1 - Math.pow(1 - progress, 3);
        pathRef.current?.setAttribute("d", morph(eased));
        if (progress >= 1) {
          unsubscribe?.();
          unsubscribe = null;
        }
      });
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return (
    <div className="ink-flood" style={{ left: x, top: y }} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <path ref={pathRef} d={from} className="ink-flood__path" />
      </svg>
    </div>
  );
}
