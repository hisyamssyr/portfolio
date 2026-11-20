"use client";

import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content";
import { cx } from "@/lib/cx";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { onFrame } from "@/lib/raf";
import { useInteraction } from "../providers";

const hello = ["SAY", "HELLO"];

export default function Contact() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [melting, setMelting] = useState(false);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const { rippleAt } = useInteraction();

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

  const magnetic = (event: React.PointerEvent) => {
    if (!fine || reduced) return;
    const button = ctaRef.current;
    const section = sectionRef.current;
    if (!button || !section) return;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    if (distance < 150) {
      const pull = 1 - distance / 150;
      button.style.transform = `translate(${dx * pull * 0.12}px, ${dy * pull * 0.16}px)`;
    } else {
      button.style.transform = "";
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
      window.setTimeout(() => setCopyError(false), 2200);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={cx("section contact", melting && !reduced && "is-melting")}
      aria-labelledby="contact-title"
    >
      <div className="section-inner" onPointerMove={magnetic}>
        <div className="section-eyebrow">
          <span className="section-eyebrow__dot" aria-hidden="true" />
          <span className="label">08 / CONTACT</span>
        </div>

        <div
          className="contact__stage"
          onPointerMove={() => {
            if (!melting) setMelting(true);
          }}
          onPointerLeave={() => setMelting(false)}
          onPointerDown={() => setMelting(true)}
          onPointerUp={() => setMelting(false)}
        >
          <span className="contact__echo display outline-type" aria-hidden="true">
            CONTACT
          </span>
          <h2 id="contact-title" ref={titleRef} className="contact__title display" aria-label="Say hello">
            {hello.map((word, wordIndex) => (
              <span key={word} className="contact__word" aria-hidden="true">
                {word.split("").map((char, index) => (
                  <span
                    key={`${char}-${index}`}
                    className="contact-letter"
                  >
                    {char}
                  </span>
                ))}
                {wordIndex === 0 && <span className="contact__gap" />}
              </span>
            ))}
          </h2>
        </div>

        <div ref={panelRef} className="contact__panel glass glass--text">
          <div className="contact__primary">
            <a
              ref={ctaRef}
              className="contact__mail"
              href={`mailto:${site.email}`}
              data-cursor="open"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                rippleAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
              }}
            >
              <Mail size={22} strokeWidth={1.5} aria-hidden="true" />
              <span>{site.email}</span>
              <ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
              <span className={cx("contact__stamp mono", copied && "is-visible")}>
                COPIED
              </span>
              {copyError && (
                <span className="contact__copy-error mono" role="status">
                  COPY FAILED — SELECT THE ADDRESS
                </span>
              )}
            </a>
            <button
              type="button"
              className="contact__copy"
              onClick={copy}
              aria-label="Copy email address"
            >
              {copied ? (
                <Check size={17} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Copy size={17} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="contact__links">
            <a href={`tel:${site.phone}`} className="contact__link" data-cursor="open">
              <span className="mono">PHONE</span>
              <span>{site.phoneDisplay}</span>
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>
            <a
              href={site.linkedin.href}
              target="_blank"
              rel="noreferrer noopener"
              className="contact__link"
              data-cursor="open"
            >
              <span className="mono">LINKEDIN</span>
              <span>{site.linkedin.label}</span>
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>
            <a
              href={site.github.href}
              target="_blank"
              rel="noreferrer noopener"
              className="contact__link"
              data-cursor="open"
            >
              <span className="mono">GITHUB</span>
              <span>{site.github.label}</span>
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>

          <div className="contact__foot">
            <span className="mono">BASED IN {site.location.toUpperCase()}</span>
            {site.cvUrl ? (
              <a href={site.cvUrl} className="mono contact__cv" data-cursor="open">
                CV ↗
              </a>
            ) : (
              <span className="contact__cv-slot mono" aria-hidden="true">CV — /</span>
            )}
          </div>
        </div>
      </div>

      <footer className="contact__footer">
        <span className="mono">{site.footer}</span>
        <span className="mono">HSR · INK &amp; GLASS</span>
      </footer>
    </section>
  );
}
