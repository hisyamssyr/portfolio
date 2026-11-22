"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { onFrame } from "@/lib/raf";

type Props = {
  mode: "ramadan" | "schematics" | "hmtc";
  paused: boolean;
};

type Palette = {
  text: string;
  faint: string;
  glass: string;
  border: string;
  lime: string;
  limeSoft: string;
};

const palette: Palette = {
  text: "rgba(244,244,240,0.86)",
  faint: "rgba(244,244,240,0.2)",
  glass: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.18)",
  lime: "#C8FF3E",
  limeSoft: "rgba(200,255,62,0.35)",
};

const vendors = Array.from({ length: 15 }, (_, index) => ({
  angle: (index / 15) * Math.PI * 2 + 0.4,
  progress: (index * 0.137) % 1,
  speed: 0.0019 + (index % 4) * 0.0004,
  radius: 0.44 + (index % 3) * 0.055,
}));

const staff = Array.from({ length: 25 }, (_, index) => ({
  phase: (index / 25) * Math.PI * 2,
  radius: 0.17 + (index % 5) * 0.027,
}));

const participants = Array.from({ length: 700 }, (_, index) => ({
  angle: (index * 2.399963) % (Math.PI * 2),
  radius: (index % 70) / 70,
  speed: 0.00022 + ((index * 17) % 60) / 160000,
  size: index % 9 === 0 ? 1.6 : 0.9,
  offsetX: 0,
  offsetY: 0,
  velX: 0,
  velY: 0,
}));

const flows = Array.from({ length: 90 }, (_, index) => ({
  segment: index % 3,
  progress: (index * 0.1137) % 1,
  speed: 0.0024 + (index % 4) * 0.0005,
}));

const hmtcParticles = Array.from({ length: 42 }, (_, index) => ({
  edge: index % 3,
  progress: (index * 0.173) % 1,
  speed: 0.0028 + (index % 3) * 0.0006,
}));

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export default function OrgCanvas({ mode, paused }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
  const reduced = useReducedMotion();
  const pointer = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0;
    let height = 0;
    let time = 0;
    let visible = false;
    let unsubscribe: (() => void) | null = null;
    let observer: IntersectionObserver | null = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(200, rect.width);
      height = Math.max(130, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw();
    };

    const drawRamadan = (p: Palette) => {
      const cx = width * 0.5;
      const cy = height * 0.5;
      const maxR = Math.min(width, height) * 0.46;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = p.faint;
      ctx.lineWidth = 0.7;
      for (const person of staff) {
        const angle = person.phase + time * 0.00018;
        const radius = person.radius * Math.min(width, height);
        const x = cx + Math.cos(angle) * radius * 1.6;
        const y = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = p.text;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      for (const vendor of vendors) {
        vendor.progress = (vendor.progress + vendor.speed) % 1;
        const angle = vendor.angle + vendor.progress * 0.4;
        const radius = vendor.radius * Math.min(width, height) * (1 - vendor.progress);
        const x = cx + Math.cos(angle) * radius * 1.35;
        const y = cy + Math.sin(angle) * radius;
        ctx.fillStyle = p.lime;
        ctx.globalAlpha = 0.3 + vendor.progress * 0.6;
        ctx.fillRect(x - 1.3, y - 1.3, 2.6, 2.6);
        ctx.globalAlpha = 1;
      }

      for (const person of participants) {
        person.radius = (person.radius + person.speed) % 1;
        const angle = person.angle + person.radius * 0.55;
        const radius = (0.06 + person.radius * 0.94) * maxR;
        let x = cx + Math.cos(angle) * radius * 1.7;
        let y = cy + Math.sin(angle) * radius;
        x += person.offsetX;
        y += person.offsetY;
        person.offsetX += person.velX;
        person.offsetY += person.velY;
        person.velX *= 0.93;
        person.velY *= 0.93;
        person.offsetX *= 0.985;
        person.offsetY *= 0.985;
        ctx.fillStyle = person.radius > 0.8 ? p.lime : p.text;
        ctx.globalAlpha = person.radius > 0.8 ? 0.6 : 0.32;
        ctx.fillRect(x, y, person.size, person.size);
        ctx.globalAlpha = 1;
      }

      if (pointer.current.active) {
        for (const person of participants) {
          const angle = person.angle + person.radius * 0.55;
          const radius = (0.06 + person.radius * 0.94) * maxR;
          const x = cx + Math.cos(angle) * radius * 1.7;
          const y = cy + Math.sin(angle) * radius;
          const dx = x - pointer.current.x;
          const dy = y - pointer.current.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 62) {
            const force = (1 - distance / 62) * 2.4;
            person.velX += (dx / (distance || 1)) * force;
            person.velY += (dy / (distance || 1)) * force;
          }
        }
        pointer.current.active = false;
      }

      ctx.fillStyle = p.glass;
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.085, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = p.lime;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.text;
      ctx.globalAlpha = 0.6;
      ctx.font = '8px "DM Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText("HUB", cx, cy + Math.min(width, height) * 0.085 + 12);
      ctx.globalAlpha = 1;
    };

    const drawSchematics = (p: Palette) => {
      ctx.clearRect(0, 0, width, height);
      const nodes = [
        { label: "REGISTRATION", x: 0.12 },
        { label: "SHEET → SQL", x: 0.38 },
        { label: "LOOKER", x: 0.64 },
        { label: "BULK SEND", x: 0.89 },
      ];
      const y = height * 0.43;
      const nodeW = Math.min(width * 0.2, 96);
      const nodeH = Math.min(height * 0.34, 46);

      ctx.strokeStyle = p.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x * width + nodeW / 2, y);
      ctx.lineTo(nodes[3].x * width - nodeW / 2, y);
      ctx.stroke();

      for (const flow of flows) {
        flow.progress = (flow.progress + flow.speed) % 1;
        const startX = nodes[flow.segment].x * width + nodeW / 2;
        const endX = nodes[flow.segment + 1].x * width - nodeW / 2;
        const x = startX + (endX - startX) * flow.progress;
        const wobble = Math.sin(time * 0.002 + flow.progress * 8) * 2.5;
        ctx.fillStyle = p.lime;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.arc(x, y + wobble, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      nodes.forEach((node) => {
        const x = node.x * width - nodeW / 2;
        roundedRect(ctx, x, y - nodeH / 2, nodeW, nodeH, 9);
        ctx.fillStyle = p.glass;
        ctx.fill();
        ctx.strokeStyle = p.border;
        ctx.stroke();
        ctx.fillStyle = p.text;
        ctx.font = '8px "DM Mono", monospace';
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x * width, y + 2);
      });

      ctx.fillStyle = p.faint;
      ctx.font = '8px "DM Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText("DATA FLOW", 12, 18);
    };

    const drawHmtc = (p: Palette) => {
      ctx.clearRect(0, 0, width, height);
      const cx = width * 0.5;
      const cy = height * 0.5;
      const nodes = [
        { label: "SIAPIN KARIRMU", x: width * 0.22, y: height * 0.26 },
        { label: "ORACLE + TELKOM", x: width * 0.8, y: height * 0.3 },
        { label: "BENCHMARKING", x: width * 0.6, y: height * 0.79 },
      ];

      ctx.strokeStyle = p.faint;
      ctx.lineWidth = 0.8;
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
      });

      for (const particle of hmtcParticles) {
        particle.progress = (particle.progress + particle.speed) % 1;
        const node = nodes[particle.edge];
        const x = cx + (node.x - cx) * particle.progress;
        const y = cy + (node.y - cy) * particle.progress;
        ctx.fillStyle = p.lime;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      nodes.forEach((node) => {
        roundedRect(ctx, node.x - 42, node.y - 11, 84, 22, 11);
        ctx.fillStyle = p.glass;
        ctx.fill();
        ctx.strokeStyle = p.border;
        ctx.stroke();
        ctx.fillStyle = p.text;
        ctx.font = '7.5px "DM Mono", monospace';
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + 2.5);
      });

      ctx.fillStyle = p.glass;
      ctx.strokeStyle = p.border;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = p.lime;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.text;
      ctx.font = '7px "DM Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText("HMTC", cx, cy + 11);
    };

    const draw = () => {
      const p = palette;
      if (mode === "ramadan") drawRamadan(p);
      if (mode === "schematics") drawSchematics(p);
      if (mode === "hmtc") drawHmtc(p);
    };

    const subscribe = () => {
      if (unsubscribe) return;
      unsubscribe = onFrame((now) => {
        if (!visible || reduced) {
          if (reduced) draw();
          return;
        }
        if (pausedRef.current) return;
        time = now;
        draw();
      });
    };

    const stop = () => {
      unsubscribe?.();
      unsubscribe = null;
    };

    resize();
    if (reduced) draw();
    observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          subscribe();
          if (reduced) draw();
        } else {
          stop();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(canvas);
    window.addEventListener("resize", resize);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) subscribe();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mode, reduced]);

  return (
    <canvas
      ref={ref}
      className="org-canvas"
      aria-hidden="true"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          active: true,
        };
      }}
      onPointerLeave={() => {
        pointer.current.active = false;
      }}
    />
  );
}
