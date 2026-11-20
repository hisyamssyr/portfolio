"use client";

import { useEffect } from "react";
import { onFrame } from "@/lib/raf";

export default function ScrollDirector() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const wordmark = document.querySelector<HTMLElement>(".wordmark");
    let lastY = window.scrollY;
    let velocity = 0;
    let squish = false;
    let squishTimer = 0;

    const onScroll = () => {
      const current = window.scrollY;
      const delta = current - lastY;
      lastY = current;
      velocity += Math.max(-80, Math.min(80, delta));
      if (wordmark) {
        const shouldSquish = Math.abs(delta) > 6;
        if (shouldSquish !== squish) {
          squish = shouldSquish;
          wordmark.dataset.squish = String(shouldSquish);
        }
        window.clearTimeout(squishTimer);
        squishTimer = window.setTimeout(() => {
          squish = false;
          if (wordmark) wordmark.dataset.squish = "false";
        }, 200);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const unsubscribe = reduced
      ? () => {}
      : onFrame(() => {
          velocity *= 0.88;
          if (Math.abs(velocity) < 0.08) velocity = 0;
          const skew = Math.max(-1.4, Math.min(1.4, velocity * 0.055));
          root.style.setProperty("--scroll-skew", `${skew.toFixed(3)}deg`);
        });

    let ctx: { revert?: () => void } | null = null;
    let cancelled = false;

    const setup = async () => {
      if (reduced) return;
      try {
        const gsapModule = await import("gsap");
        const scrollTriggerModule = await import("gsap/ScrollTrigger");
        if (cancelled) return;
        const gsap = gsapModule.default;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
            const amount = Number(element.dataset.parallax ?? 8);
            gsap.to(element, {
              yPercent: amount,
              ease: "none",
              scrollTrigger: {
                trigger: element.closest("section") ?? element,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1,
              },
            });
          });
        });
        ctx = context;
        ScrollTrigger.refresh();
      } catch {
        ctx = null;
      }
    };

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      window.removeEventListener("wheel", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("pointerdown", start);
      void setup();
    };
    window.addEventListener("wheel", start, { passive: true });
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("pointerdown", start, { passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(squishTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("pointerdown", start);
      unsubscribe();
      ctx?.revert?.();
    };
  }, []);

  return null;
}
