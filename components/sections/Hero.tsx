"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { projects, site } from "@/content";
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
  drag,
  outline = false,
}: {
  char: string;
  drag: boolean;
  outline?: boolean;
}) {
  return (
    <motion.span
      className="hero-letter"
      drag={drag}
      dragSnapToOrigin
      dragElastic={0.16}
      dragMomentum
      dragTransition={{ bounceStiffness: 380, bounceDamping: 24, power: 0.32 }}
      whileDrag={{ scale: 1.08, zIndex: 6 }}
      data-cursor="drag"
      style={{ touchAction: drag ? "none" : undefined }}
    >
      <span className={`fall-letter${outline ? " hero-letter--outline" : ""}`}>{char}</span>
    </motion.span>
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
      <span className="intro__skip mono">Click to skip</span>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const wordsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const chipsRef = useRef<Array<HTMLDivElement | null>>([]);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const idle = useSiteIdle();
  const { navigateTo } = useInteraction();
  const altAvailable = usePhotoAvailable("profile/portrait-alt");
  const mainAvailable = usePhotoAvailable("profile/portrait-main");
  const [introDone, setIntroDone] = useState(false);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [thread, setThread] = useState<string>("");
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
    if (!section || !name || reduced || !fine) return;
    const letters = Array.from(name.querySelectorAll<HTMLElement>(".fall-letter"));
    let running = false;
    let pointer = { x: 0, y: 0 };
    let unsubscribe: (() => void) | null = null;

    const frame = () => {
      for (const letter of letters) {
        const rect = letter.getBoundingClientRect();
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top + rect.height / 2);
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

  const buildThread = (index: number) => {
    const section = sectionRef.current;
    const word = wordsRef.current[index];
    const chip = chipsRef.current[index];
    if (!section || !word || !chip) return;
    const sectionRect = section.getBoundingClientRect();
    const wordRect = word.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const x1 = wordRect.right - sectionRect.left;
    const y1 = wordRect.top + wordRect.height / 2 - sectionRect.top;
    const x2 = chipRect.left + chipRect.width * 0.18 - sectionRect.left;
    const y2 = chipRect.top + chipRect.height / 2 - sectionRect.top;
    const bend = Math.min(140, Math.abs(x2 - x1) * 0.4 + 40);
    setThread(`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`);
  };

  useEffect(() => {
    if (activeWord === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThread("");
      return;
    }
    buildThread(activeWord);
    const onResize = () => buildThread(activeWord);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeWord]);

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
        <span>PORTFOLIO — 2026</span>
        <span>{site.monoLine}</span>
      </div>

      <h1
        id="hero-name"
        ref={nameRef}
        className="hero__name display"
        aria-label={site.name}
      >
        <span className="hero__line hero__line--one" aria-hidden="true">
          {lineOne.split("").map((char, index) => (
            <HeroLetter key={`${char}-${index}`} char={char} drag={fine && introDone} />
          ))}
        </span>
        <span className="hero__line hero__line--two" aria-hidden="true">
          {lineTwoA.split("").map((char, index) => (
            <HeroLetter key={`a-${char}-${index}`} char={char} drag={fine && introDone} />
          ))}
          <span className="hero__gap" />
          {lineTwoB.split("").map((char, index) => (
            <HeroLetter
              key={`b-${char}-${index}`}
              char={char}
              drag={fine && introDone}
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
              <div className="hero-portrait__photo hero-portrait__photo--alt" aria-hidden={!altOn}>
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
            data-cursor="view"
          >
            {altOn ? "MAIN" : "ALT"}
          </button>
        )}
      </div>

      <div className="hero__words">
        {site.heroWords.map((item, index) => (
          <button
            key={item.word}
            ref={(node) => {
              wordsRef.current[index] = node;
            }}
            type="button"
            className={cx("hero__word serif", activeWord === index && "is-lit")}
            onPointerEnter={() => setActiveWord(index)}
            onPointerLeave={() => setActiveWord(null)}
            onFocus={() => setActiveWord(index)}
            onBlur={() => setActiveWord(null)}
            onClick={(event) => {
              if (event.detail === 0) return;
              setActiveWord((current) => (current === index ? null : index));
            }}
            aria-label={`Trace ${item.word} to its project`}
            data-cursor="view"
          >
            {item.word}
          </button>
        ))}
      </div>

      <div className="hero__objects">
        {projects.map((project, index) => (
          <div
            key={project.id}
            ref={(node) => {
              chipsRef.current[index] = node;
            }}
            className={cx(
              "hero-chip glass",
              activeWord !== null &&
                site.heroWords[activeWord].projectId === project.id &&
                "is-pulsing",
            )}
          >
            <span className="hero-chip__num mono">{project.number}</span>
            <span className="hero-chip__title">{project.title}</span>
          </div>
        ))}
      </div>

      <svg className="hero__threads" aria-hidden="true">
        {thread && <path d={thread} className="hero__thread" />}
      </svg>

      <div className="hero__foot">
        <a
          href="#about"
          className="scroll-hint"
          onClick={(event) => {
            event.preventDefault();
            navigateTo("about", event.currentTarget);
          }}
          aria-label="Scroll to About"
          data-cursor="open"
        >
          <span className="scroll-hint__line">
            <span className="scroll-hint__drip" />
          </span>
          <span className="mono">SCROLL</span>
        </a>
      </div>

      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
    </section>
  );
}
