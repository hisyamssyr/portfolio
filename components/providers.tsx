"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import FloodBlob from "./FloodBlob";

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
