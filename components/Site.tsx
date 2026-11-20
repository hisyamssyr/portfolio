"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { navSections, type SectionId } from "@/content";
import { useReducedMotion } from "@/lib/hooks";
import Ambient from "./Ambient";
import Cursor from "./Cursor";
import Dock from "./Dock";
import FrostLens from "./FrostLens";
import GooDefs from "./GooDefs";
import Grain from "./Grain";
import {
  InteractionProvider,
  PhotoProvider,
  SkillFocusProvider,
  ThemeProvider,
  useInteraction,
  useTheme,
} from "./providers";
import ScrollDirector from "./ScrollDirector";
import About from "./sections/About";
import Contact from "./sections/Contact";
import Education from "./sections/Education";
import Experience from "./sections/Experience";
import Hero from "./sections/Hero";
import Organizations from "./sections/Organizations";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

function SiteContent() {
  const { navigateTo, openPalette, paletteOpen, rippleAt } = useInteraction();
  const { toggleTheme } = useTheme();
  const reduced = useReducedMotion();
  const pointer = useRef({ x: 0, y: 0 });
  const [paletteEverOpened, setPaletteEverOpened] = useState(false);

  useEffect(() => {
    if (paletteOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaletteEverOpened(true);
    }
  }, [paletteOpen]);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, []);

  useEffect(() => {
    const typing = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      Boolean(
        target.closest(
          'input, textarea, select, [contenteditable="true"], [role="textbox"]',
        ),
      );

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (typing(event.target)) return;
      if (event.key === "/" && !paletteOpen) {
        event.preventDefault();
        openPalette();
        return;
      }
      if ((event.key === "i" || event.key === "I") && !paletteOpen) {
        event.preventDefault();
        toggleTheme(pointer.current);
        return;
      }
      if (!paletteOpen && /^[1-8]$/.test(event.key)) {
        const section = navSections[Number(event.key) - 1];
        if (section) {
          event.preventDefault();
          navigateTo(section.id as SectionId);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigateTo, openPalette, paletteOpen, toggleTheme]);

  useEffect(() => {
    let lastTap = 0;
    let lastX = 0;
    let lastY = 0;
    const onDouble = (event: MouseEvent) => {
      rippleAt(event.clientX, event.clientY);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      const now = performance.now();
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      if (now - lastTap < 320 && distance < 36) {
        rippleAt(event.clientX, event.clientY);
        lastTap = 0;
      } else {
        lastTap = now;
        lastX = event.clientX;
        lastY = event.clientY;
      }
    };
    window.addEventListener("dblclick", onDouble);
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    return () => {
      window.removeEventListener("dblclick", onDouble);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [rippleAt]);

  useEffect(() => {
    if (reduced) {
      window.dispatchEvent(new CustomEvent("hsr:idle", { detail: false }));
      return;
    }
    let idle = false;
    let timer = 0;
    let last = 0;
    const set = (value: boolean) => {
      if (idle === value) return;
      idle = value;
      window.dispatchEvent(new CustomEvent("hsr:idle", { detail: value }));
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => set(true), 25000);
    };
    const activity = () => {
      const now = performance.now();
      if (now - last < 500) return;
      last = now;
      set(false);
      schedule();
    };
    schedule();
    const events: Array<keyof WindowEventMap> = [
      "pointermove",
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart",
      "scroll",
    ];
    events.forEach((name) =>
      window.addEventListener(name, activity, { passive: true }),
    );
    const onVisibility = () => {
      if (document.hidden) {
        window.clearTimeout(timer);
        set(false);
      } else {
        schedule();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, activity));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GooDefs />
      <Ambient />
      <div className="ambient-veil" aria-hidden="true" />
      <Grain />
      <Cursor />
      <FrostLens />
      <ScrollDirector />

      <a
        href="#home"
        className="wordmark"
        aria-label="Hisyam Syafa Raditya — back to home"
        onClick={(event) => {
          event.preventDefault();
          navigateTo("home", event.currentTarget);
        }}
      >
        HSR
      </a>

      <main id="main" className="page">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Organizations />
        <Skills />
        <Education />
        <Contact />
      </main>

      <Dock />
      {paletteEverOpened && <CommandPalette />}
    </>
  );
}

export default function Site({ photos }: { photos: Record<string, boolean> }) {
  return (
    <ThemeProvider>
      <SkillFocusProvider>
        <PhotoProvider photos={photos}>
          <InteractionProvider>
            <SiteContent />
          </InteractionProvider>
        </PhotoProvider>
      </SkillFocusProvider>
    </ThemeProvider>
  );
}
