"use client";

import { useEffect, useRef } from "react";
import { onFrame } from "@/lib/raf";

type Orb = {
  x: number;
  y: number;
  r: number;
  ax: number;
  ay: number;
  speed: number;
  phase: number;
  color: "white" | "gray" | "lime";
  alpha: number;
};

const orbs: Orb[] = [
  { x: 0.24, y: 0.22, r: 0.44, ax: 0.1, ay: 0.06, speed: 0.00016, phase: 0, color: "white", alpha: 0.16 },
  { x: 0.76, y: 0.34, r: 0.38, ax: 0.08, ay: 0.09, speed: 0.00012, phase: 2.1, color: "gray", alpha: 0.2 },
  { x: 0.52, y: 0.78, r: 0.5, ax: 0.12, ay: 0.05, speed: 0.0001, phase: 4.4, color: "white", alpha: 0.1 },
  { x: 0.62, y: 0.62, r: 0.3, ax: 0.14, ay: 0.1, speed: 0.00014, phase: 1.2, color: "lime", alpha: 0.1 },
];

export default function Ambient() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let unsubscribe: (() => void) | null = null;

    const particles = Array.from({ length: 30 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.000025,
      vy: -0.000006 - Math.random() * 0.000018,
      r: 0.6 + Math.random() * 1.7,
      phase: index * 0.7,
    }));

    const resize = () => {
      width = Math.max(160, Math.floor(window.innerWidth / 5.5));
      height = Math.max(140, Math.floor(window.innerHeight / 5.5));
      canvas.width = width;
      canvas.height = height;
    };

    const colorFor = (color: Orb["color"]) => {
      if (color === "lime") return "200, 255, 62";
      if (color === "gray") return "169, 171, 179";
      return "244, 244, 240";
    };

    let lastDraw = 0;
    const draw = (time: number) => {
      if (!reduced && time - lastDraw < 55) return;
      lastDraw = time;
      ctx.clearRect(0, 0, width, height);
      const t = reduced ? 0 : time;
      for (const orb of orbs) {
        const x =
          (orb.x + Math.sin(t * orb.speed + orb.phase) * orb.ax) * width;
        const y =
          (orb.y + Math.cos(t * orb.speed * 0.8 + orb.phase) * orb.ay) * height;
        const r = orb.r * Math.max(width, height) * 0.82;
        const rgb = colorFor(orb.color);
        const alpha = orb.alpha;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`);
        gradient.addColorStop(0.55, `rgba(${rgb}, ${alpha * 0.32})`);
        gradient.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
      if (!reduced) {
        for (const particle of particles) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.y < -0.05) {
            particle.y = 1.05;
            particle.x = Math.random();
          }
          if (particle.x < -0.05) particle.x = 1.05;
          if (particle.x > 1.05) particle.x = -0.05;
          const alpha =
            0.28 *
            (0.55 + Math.sin(t * 0.0005 + particle.phase) * 0.45);
          ctx.fillStyle = `rgba(244, 244, 240, ${alpha})`;
          ctx.beginPath();
          ctx.arc(
            particle.x * width,
            particle.y * height,
            particle.r * 0.55,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    };

    resize();
    if (reduced) {
      draw(0);
    } else {
      unsubscribe = onFrame(draw);
    }

    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) {
        unsubscribe?.();
        unsubscribe = null;
      } else if (!unsubscribe) {
        unsubscribe = onFrame(draw);
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe?.();
    };
  }, []);

  return <canvas ref={ref} className="ambient-canvas" aria-hidden="true" />;
}
