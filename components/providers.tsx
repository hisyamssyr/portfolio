"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Polarity, Skill } from "@/content";
import FloodBlob from "./FloodBlob";

type ThemeContextValue = {
  theme: Polarity;
  setTheme: (next: Polarity, origin?: { x: number; y: number }) => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const wipeColors: Record<Polarity, string> = {
  dark: "#050507",
  frost: "#ECECE6",
};

type Wipe = {
  key: number;
  x: number;
  y: number;
  to: Polarity;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Polarity>("dark");
  const [wipe, setWipe] = useState<Wipe | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const domTheme = document.documentElement.dataset.theme as Polarity | undefined;
    if (domTheme === "dark" || domTheme === "frost") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(domTheme);
    } else {
      const stored = window.localStorage.getItem("hsr-polarity") as Polarity | null;
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      const initial = stored ?? (prefersLight ? "frost" : "dark");
      setThemeState(initial);
      document.documentElement.dataset.theme = initial;
    }
  }, []);

  const setTheme = useCallback(
    (next: Polarity, origin?: { x: number; y: number }) => {
      if (next === theme) return;
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
      const apply = () => {
        document.documentElement.dataset.theme = next;
        window.localStorage.setItem("hsr-polarity", next);
        setThemeState(next);
      };
      if (origin) {
        setWipe({
          key: Date.now(),
          x: origin.x,
          y: origin.y,
          to: next,
        });
        timers.current.push(window.setTimeout(apply, 430));
        timers.current.push(window.setTimeout(() => setWipe(null), 820));
      } else {
        apply();
      }
    },
    [theme],
  );

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      setTheme(theme === "dark" ? "frost" : "dark", origin);
    },
    [setTheme, theme],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {wipe && (
        <div
          key={wipe.key}
          aria-hidden="true"
          className="theme-wipe"
          style={{
            background: wipeColors[wipe.to],
            ["--wx" as string]: `${wipe.x}px`,
            ["--wy" as string]: `${wipe.y}px`,
          }}
        />
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

type FocusContextValue = {
  focused: Skill | null;
  focusSkill: (skill: Skill | null) => void;
};

const FocusContext = createContext<FocusContextValue | null>(null);

export function SkillFocusProvider({ children }: { children: ReactNode }) {
  const [focused, setFocused] = useState<Skill | null>(null);
  const value = useMemo(
    () => ({ focused, focusSkill: setFocused }),
    [focused],
  );
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useSkillFocus() {
  const value = useContext(FocusContext);
  if (!value) throw new Error("useSkillFocus must be used inside SkillFocusProvider");
  return value;
}

type FloodEvent = { key: number; x: number; y: number };
type RippleEvent = { key: number; x: number; y: number };

type InteractionContextValue = {
  navigateTo: (id: string, origin?: HTMLElement | { x: number; y: number }) => void;
  rippleAt: (x: number, y: number) => void;
  openPalette: () => void;
  paletteOpen: boolean;
  closePalette: () => void;
};

const InteractionContext = createContext<InteractionContextValue | null>(null);

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [flood, setFlood] = useState<FloodEvent | null>(null);
  const [ripples, setRipples] = useState<RippleEvent[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const rippleAt = useCallback((x: number, y: number) => {
    const key = Date.now() + Math.random();
    setRipples((current) => [...current.slice(-4), { key, x, y }]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.key !== key));
    }, 1300);
  }, []);

  const navigateTo = useCallback(
    (id: string, origin?: HTMLElement | { x: number; y: number }) => {
      let point = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      if (origin instanceof HTMLElement) {
        const rect = origin.getBoundingClientRect();
        point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      } else if (origin) {
        point = origin;
      }
      setFlood({ key: Date.now(), ...point });
      const target = document.getElementById(id);
      const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "auto"
        : "smooth";
      window.setTimeout(() => {
        target?.scrollIntoView({ behavior, block: "start" });
        window.history.replaceState(null, "", `#${id}`);
      }, 140);
      window.setTimeout(() => setFlood(null), 760);
    },
    [],
  );

  const value = useMemo(
    () => ({
      navigateTo,
      rippleAt,
      openPalette: () => setPaletteOpen(true),
      closePalette: () => setPaletteOpen(false),
      paletteOpen,
    }),
    [navigateTo, paletteOpen, rippleAt],
  );

  return (
    <InteractionContext.Provider value={value}>
      {children}
      <div className="fxlayer" aria-hidden="true">
        {flood && <FloodBlob key={flood.key} x={flood.x} y={flood.y} />}
        {ripples.map((ripple) => (
          <span
            key={ripple.key}
            className="light-ripple"
            style={{ left: ripple.x, top: ripple.y }}
          />
        ))}
      </div>
    </InteractionContext.Provider>
  );
}

export function useInteraction() {
  const value = useContext(InteractionContext);
  if (!value) throw new Error("useInteraction must be used inside InteractionProvider");
  return value;
}

const PhotoContext = createContext<Record<string, boolean>>({});

export function PhotoProvider({
  photos,
  children,
}: {
  photos: Record<string, boolean>;
  children: ReactNode;
}) {
  return <PhotoContext.Provider value={photos}>{children}</PhotoContext.Provider>;
}

export function usePhotoAvailable(id: string): boolean {
  return Boolean(useContext(PhotoContext)[id]);
}

export function usePhotoMap(): Record<string, boolean> {
  return useContext(PhotoContext);
}
