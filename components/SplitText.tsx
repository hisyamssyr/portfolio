"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/lib/hooks";

export function useSiteIdle(): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const onIdle = (event: Event) => {
      setIdle(Boolean((event as CustomEvent<boolean>).detail));
    };
    window.addEventListener("hsr:idle", onIdle);
    return () => window.removeEventListener("hsr:idle", onIdle);
  }, []);
  return idle;
}

export function useFallLetters(
  ref: React.RefObject<HTMLElement | null>,
  idle: boolean,
  enabled = true,
) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const letters = Array.from(root.querySelectorAll<HTMLElement>(".fall-letter"));
    if (!enabled || reduced) {
      letters.forEach((letter) => {
        letter.style.setProperty("--fall-y", "0px");
        letter.style.setProperty("--fall-x", "0px");
        letter.style.setProperty("--fall-r", "0deg");
      });
      root.classList.remove("is-falling");
      return;
    }
    if (!idle) {
      root.classList.remove("is-falling");
      letters.forEach((letter) => {
        letter.style.setProperty("--fall-y", "0px");
        letter.style.setProperty("--fall-x", "0px");
        letter.style.setProperty("--fall-r", "0deg");
      });
      return;
    }
    const container = root.getBoundingClientRect();
    if (container.bottom < 0 || container.top > window.innerHeight) return;
    root.classList.add("is-falling");
    letters.forEach((letter, index) => {
      const rect = letter.getBoundingClientRect();
      const fall = Math.max(
        40,
        window.innerHeight - rect.bottom - 16 + ((index * 37) % 46) - 23,
      );
      const jitter = ((index * 53) % 40) - 20;
      const rotation = ((index * 29) % 22) - 11;
      letter.style.setProperty("--fall-y", `${fall.toFixed(1)}px`);
      letter.style.setProperty("--fall-x", `${jitter}px`);
      letter.style.setProperty("--fall-r", `${rotation}deg`);
      letter.style.setProperty("--fall-delay", `${(index % 6) * 22}ms`);
    });
  }, [idle, enabled, reduced, ref]);
}

export function SplitHeading({
  text,
  as = "h2",
  className,
  ariaLabel,
  children,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  ariaLabel?: string;
  children?: ReactNode;
}) {
  const Tag = as as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const idle = useSiteIdle();
  useFallLetters(ref, idle);

  return (
    <Tag ref={ref} className={className} aria-label={ariaLabel ?? text}>
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="fall-letter"
          aria-hidden="true"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char}
        </span>
      ))}
      {children}
    </Tag>
  );
}
