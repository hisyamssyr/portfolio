"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content";
import { cx } from "@/lib/cx";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { onFrame } from "@/lib/raf";
import { Photo } from "../Photo";
import { useInteraction, usePhotoAvailable } from "../providers";
import { useFallLetters, useSiteIdle } from "../SplitText";

const lineOne = "HISYAM";
const lineTwoA = "SYAFA";
const lineTwoB = "RADITYA";

function HeroLetter({
  char,
  index,
  outline = false,
}: {
  char: string;
  index: number;
  outline?: boolean;
}) {
  return (
    <span
      className="hero-letter"
      style={{ "--letter-i": index } as React.CSSProperties}
    >
      <span className={`fall-letter${outline ? " hero-letter--outline" : ""}`}>{char}</span>
    </span>
  );
}

function Intro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    const seen = window.sessionStorage.getItem("hsr-intro");
    if (seen === "done") {
      onDone();
      return;
    }
    const finish = () => {
      window.sessionStorage.setItem("hsr-intro", "done");
      setLeaving(true);
      window.setTimeout(onDone, 340);
    };
    const timer = window.setTimeout(finish, 760);
    const onKey = () => finish();
    const onPointer = () => finish();
    window.addEventListener("keydown", onKey, { once: true });
    window.addEventListener("pointerdown", onPointer, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [onDone, reduced]);

  if (reduced) return null;

  return (
    <div className={cx("intro", leaving && "is-leaving")} aria-hidden="true">
      <span className="intro__drop" />
      <span className="intro__wordmark">HSR</span>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const idle = useSiteIdle();
  const { navigateTo } = useInteraction();
  const altAvailable = usePhotoAvailable("profile/portrait-alt");
  const mainAvailable = usePhotoAvailable("profile/portrait-main");
  const [introDone, setIntroDone] = useState(false);
  const [altOn, setAltOn] = useState(false);

  useFallLetters(nameRef, idle, introDone);

  const rotateX = useSpring(0, { stiffness: 160, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 22 });
  const transform = useTransform(
    [rotateX, rotateY],
    ([x, y]) => `perspective(900px) rotateX(${x}deg) rotateY(${y}deg)`,
  );

  useEffect(() => {
    const section = sectionRef.current;
    const name = nameRef.current;
    if (!section || !name || reduced) return;
    const letters = fine
      ? Array.from(name.querySelectorAll<HTMLElement>(".fall-letter"))
      : [];
    let running = false;
    let pointer = { x: 0, y: 0 };
    let unsubscribe: (() => void) | null = null;

    const frame = () => {
      const rect = section.getBoundingClientRect();
      const nx = (pointer.x - rect.left) / rect.width - 0.5;
      const ny = (pointer.y - rect.top) / rect.height - 0.5;
      section.style.setProperty("--hero-x", `${(nx + 0.5) * 100}%`);
      section.style.setProperty("--hero-y", `${(ny + 0.5) * 100}%`);
      name.style.setProperty("--name-x", `${(-nx * 18).toFixed(2)}px`);
      name.style.setProperty("--name-y", `${(-ny * 12).toFixed(2)}px`);
      for (const letter of letters) {
        const letterRect = letter.getBoundingClientRect();
        const dx = pointer.x - (letterRect.left + letterRect.width / 2);
        const dy = pointer.y - (letterRect.top + letterRect.height / 2);
        const distance = Math.hypot(dx, dy);
        const falloff = Math.max(0, 1 - distance / 340);
        const eased = falloff * falloff;
        letter.style.fontVariationSettings = `"wght" ${Math.round(
          620 + 280 * eased,
        )}, "wdth" ${Math.round(86 + 42 * eased)}`;
      }
    };

    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!running) {
        running = true;
        unsubscribe = onFrame(() => {
          frame();
        });
      }
    };

    const onLeave = () => {
      running = false;
      unsubscribe?.();
      unsubscribe = null;
      section.style.removeProperty("--hero-x");
      section.style.removeProperty("--hero-y");
      name.style.removeProperty("--name-x");
      name.style.removeProperty("--name-y");
      letters.forEach((letter) => {
        letter.style.fontVariationSettings = "";
      });
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      unsubscribe?.();
    };
  }, [fine, reduced]);

  const tilt = (event: React.PointerEvent) => {
    if (!fine || reduced) return;
    const node = portraitRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 16);
    rotateX.set((0.5 - py) * 16);
    node.style.setProperty("--rim-x", `${px * 100}%`);
    node.style.setProperty("--rim-y", `${py * 100}%`);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const togglePicture = () => {
    if (!altAvailable) return;
    setAltOn((value) => !value);
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className={cx("hero", introDone && "is-ready", altOn && "show-alt")}
      aria-labelledby="hero-name"
    >
      <div className="hero__backdrop" aria-hidden="true">
        <span className="hero__blob hero__blob--one" data-parallax="12" />
        <span className="hero__blob hero__blob--two" data-parallax="-8" />
        <span className="hero__halftone halftone" aria-hidden="true" />
      </div>

      <div className="hero__topline mono">
        <span>{site.monoLine}</span>
      </div>

      <div className="hero__stage">
        <span className="hero__spotlight" aria-hidden="true" />
        <span className="hero__aura" aria-hidden="true" />
        <span className="hero__orb hero__orb--one" aria-hidden="true" data-parallax="16" />
        <span className="hero__orb hero__orb--two" aria-hidden="true" data-parallax="-12" />

        <h1
          id="hero-name"
          ref={nameRef}
          className="hero__name display"
          aria-label={site.name}
        >
          <span className="hero__line hero__line--one" aria-hidden="true">
            {lineOne.split("").map((char, index) => (
              <HeroLetter
                key={`${char}-${index}`}
                char={char}
                index={index}
              />
            ))}
          </span>
          <span className="hero__line hero__line--two" aria-hidden="true">
            {lineTwoA.split("").map((char, index) => (
              <HeroLetter
                key={`a-${char}-${index}`}
                char={char}
                index={lineOne.length + index}
              />
            ))}
            <span className="hero__gap" />
            {lineTwoB.split("").map((char, index) => (
              <HeroLetter
                key={`b-${char}-${index}`}
                char={char}
                index={lineOne.length + lineTwoA.length + index}
                outline
              />
            ))}
          </span>
        </h1>

        <div
          ref={portraitRef}
          className={cx("hero-portrait", !reduced && "is-swaying")}
          onPointerMove={tilt}
          onPointerLeave={resetTilt}
        >
          <span className="hero-portrait__orbit" aria-hidden="true">
            <span className="hero-portrait__orbit-dot" />
          </span>
          <span
            className="hero-portrait__orbit hero-portrait__orbit--inner"
            aria-hidden="true"
          >
            <span className="hero-portrait__orbit-dot" />
          </span>
          <motion.div className="hero-portrait__tilt" style={{ transform }}>
            <span className="hero-portrait__halo" aria-hidden="true" />
            <div className="hero-portrait__capsule glass">
              <div className="hero-portrait__photo">
                <Photo
                  slot="profile/portrait-main"
                  priority
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 42vw, 32vw"
                  className="hero-portrait__image"
                  placeholderVariant="portrait"
                />
              </div>
              {altAvailable && (
                <div
                  className="hero-portrait__photo hero-portrait__photo--alt"
                  aria-hidden={!altOn}
                >
                  <Photo
                    slot="profile/portrait-alt"
                    sizes="(max-width: 640px) 72vw, (max-width: 1024px) 42vw, 32vw"
                    className="hero-portrait__image"
                    placeholderVariant="portrait"
                  />
                </div>
              )}
              <span className="hero-portrait__rim" aria-hidden="true" />
              <span className="hero-portrait__grain" aria-hidden="true" />
              {mainAvailable && (
                <span className="hero-portrait__tag mono">HSR · 2026</span>
              )}
            </div>
          </motion.div>
          {altAvailable && (
            <button
              type="button"
              className="hero-portrait__swap mono"
              aria-pressed={altOn}
              onClick={togglePicture}
            >
              {altOn ? "MAIN" : "ALT"}
            </button>
          )}
        </div>
      </div>

      <div className="hero__foot">
        <a
          href="#about"
          className="scroll-hint"
          onClick={(event) => {
            event.preventDefault();
            navigateTo("about", event.currentTarget);
          }}
          aria-label="Scroll to About"
        >
          <span className="scroll-hint__line">
            <span className="scroll-hint__drip" />
          </span>
        </a>
      </div>

      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
    </section>
  );
}
