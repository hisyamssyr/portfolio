"use client";

import { Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content";
import { cx } from "@/lib/cx";
import { useReducedMotion } from "@/lib/hooks";
import { onFrame } from "@/lib/raf";
import { socialMarks } from "../socialMarks";

const hello = ["SAY", "HELLO"];

function SocialMark({ name }: { name: "github" | "linkedin" | "instagram" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={socialMarks[name]} fill="currentColor" />
    </svg>
  );
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [melting, setMelting] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    if (!section || !title || reduced) return;
    const letters = Array.from(
      title.querySelectorAll<HTMLElement>(".contact-letter"),
    );
    let running = false;
    let pointer = { x: 0, y: 0 };
    let unsubscribe: (() => void) | null = null;

    const frame = () => {
      for (const letter of letters) {
        const rect = letter.getBoundingClientRect();
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        const falloff = Math.max(0, 1 - distance / 260);
        const pull = falloff * falloff;
        letter.style.transform = `translate3d(${(dx / (distance || 1)) * pull * 16}px, ${
          (dy / (distance || 1)) * pull * 10 + pull * 14
        }px, 0) scaleY(${1 + pull * 0.22}) scaleX(${1 - pull * 0.06})`;
        letter.style.opacity = String(0.72 + pull * 0.28);
      }
    };

    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!running) {
        running = true;
        unsubscribe = onFrame(frame);
      }
    };

    const onLeave = () => {
      running = false;
      unsubscribe?.();
      unsubscribe = null;
      letters.forEach((letter) => {
        letter.style.transform = "";
        letter.style.opacity = "";
      });
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      unsubscribe?.();
    };
  }, [reduced]);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={cx("section contact", melting && !reduced && "is-melting")}
      aria-labelledby="contact-title"
    >
      <div className="section-inner">
        <div className="contact__layout">
          <div
            className="contact__stage"
            onPointerMove={() => {
              if (!melting) setMelting(true);
            }}
            onPointerLeave={() => setMelting(false)}
            onPointerDown={() => setMelting(true)}
            onPointerUp={() => setMelting(false)}
          >
            <h2
              id="contact-title"
              ref={titleRef}
              className="contact__title display"
              aria-label="Say hello"
            >
              {hello.map((word, wordIndex) => (
                <span key={word} className="contact__word" aria-hidden="true">
                  {word.split("").map((char, index) => (
                    <span key={`${char}-${index}`} className="contact-letter">
                      {char}
                    </span>
                  ))}
                  {wordIndex === 0 && <span className="contact__gap" />}
                </span>
              ))}
            </h2>
          </div>

          <div className="contact__card glass">
            <a
              className="contact__social"
              href={`mailto:${site.email}`}
              aria-label={`Email ${site.email}`}
              title={site.email}
            >
              <Mail aria-hidden="true" />
            </a>
            <a
              className="contact__social"
              href={site.linkedin.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`LinkedIn — ${site.linkedin.label}`}
              title="LinkedIn"
            >
              <SocialMark name="linkedin" />
            </a>
            <a
              className="contact__social"
              href={site.github.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`GitHub — ${site.github.label}`}
              title="GitHub"
            >
              <SocialMark name="github" />
            </a>
            <a
              className="contact__social"
              href={site.instagram.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Instagram — ${site.instagram.label}`}
              title="Instagram"
            >
              <SocialMark name="instagram" />
            </a>
          </div>
        </div>
      </div>

      <footer className="contact__footer">
        <span className="mono">{site.footer}</span>
      </footer>
    </section>
  );
}
