"use client";

import {
  BriefcaseBusiness,
  Cpu,
  GraduationCap,
  Home,
  Layers3,
  Mail,
  MoreHorizontal,
  Search,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion, useSpring } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { navSections, type SectionId } from "@/content";
import { useReducedMotion } from "@/lib/hooks";
import { onFrame } from "@/lib/raf";
import { useInteraction } from "./providers";

const icons: Record<SectionId, LucideIcon> = {
  home: Home,
  about: UserRound,
  projects: Layers3,
  experience: BriefcaseBusiness,
  organizations: UsersRound,
  skills: Cpu,
  education: GraduationCap,
  contact: Mail,
};

const sectionShortcuts: SectionId[] = [
  "home",
  "projects",
  "experience",
  "skills",
  "contact",
];

const moreShortcuts: SectionId[] = [
  "about",
  "organizations",
  "education",
];

const labelFor = (id: SectionId) =>
  navSections.find((section) => section.id === id)?.label ?? id;

function useSectionProgress() {
  const [active, setActive] = useState<SectionId>("home");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let offsets: Array<{ id: SectionId; top: number; height: number }> = [];
    const measure = () => {
      offsets = navSections.map((section) => {
        const el = document.getElementById(section.id);
        return {
          id: section.id,
          top: el?.offsetTop ?? 0,
          height: el?.offsetHeight ?? 0,
        };
      });
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    navSections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) resizeObserver.observe(el);
    });
    let lastProgress = -1;
    const unsubscribe = onFrame(() => {
      if (offsets.length === 0) return;
      const anchor = window.scrollY + window.innerHeight * 0.42;
      let current = offsets[0];
      for (const offset of offsets) {
        if (offset.top <= anchor) current = offset;
      }
      setActive((prev) => (prev === current.id ? prev : current.id));
      const start = current.top - window.innerHeight * 0.5;
      const end = current.top + current.height - window.innerHeight * 0.5;
      const next = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
      if (Math.abs(next - lastProgress) > 0.003) {
        lastProgress = next;
        setProgress(next);
      }
    });
    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      unsubscribe();
    };
  }, []);

  return { active, progress };
}

type DockIconProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  progress?: number;
  hoverX: number | null;
  tooltip: boolean;
  scaleFactor: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onHover: (hovering: boolean) => void;
  tabIndex: number;
  onFocus: () => void;
  current?: boolean;
  children?: React.ReactNode;
};

function DockIcon({
  icon: Icon,
  label,
  active = false,
  progress = 0,
  hoverX,
  tooltip,
  scaleFactor,
  onClick,
  onHover,
  tabIndex,
  onFocus,
  current,
  children,
}: DockIconProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion();
  const scale = useSpring(1, { stiffness: 420, damping: 28, mass: 0.7 });
  const [hovered, setHovered] = useState(false);
  const circumference = 2 * Math.PI * 20;

  useEffect(() => {
    if (!scaleFactor || hoverX === null || reduced) {
      scale.set(1);
      return;
    }
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(hoverX - center);
    const value = 1 + 0.6 * Math.exp(-Math.pow(distance / 54, 2));
    scale.set(value);
  }, [hoverX, reduced, scale, scaleFactor]);

  return (
    <button
      ref={ref}
      type="button"
      className={`dock__item${active ? " is-active" : ""}`}
      aria-label={label}
      aria-current={current ? "true" : undefined}
      tabIndex={tabIndex}
      data-dock-button
      onClick={onClick}
      onFocus={() => {
        setHovered(true);
        onFocus();
      }}
      onBlur={() => setHovered(false)}
      onPointerEnter={() => {
        setHovered(true);
        onHover(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
        onHover(false);
      }}
    >
      <motion.span className="dock__icon-wrap" style={{ scale }}>
        {active && (
          <motion.span
            layoutId="dock-active-pill"
            className="dock__active"
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 32, mass: 0.6 }
            }
          />
        )}
        <Icon className="dock__icon" size={20} strokeWidth={1.7} aria-hidden="true" />
        {active && (
          <svg className="dock__progress" viewBox="0 0 48 48" aria-hidden="true">
            <circle className="dock__progress-track" cx="24" cy="24" r="20" />
            <circle
              className="dock__progress-value"
              cx="24"
              cy="24"
              r="20"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
        )}
        <span className="dock__dot" aria-hidden="true" />
        {children}
      </motion.span>
      <span
        className={`dock__tooltip${hovered || tooltip ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        {label}
      </span>
    </button>
  );
}

export default function Dock() {
  const { active, progress } = useSectionProgress();
  const { navigateTo, openPalette } = useInteraction();
  const reduced = useReducedMotion();
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [condensed, setCondensed] = useState(false);
  const [roving, setRoving] = useState<number>(0);
  const [mobileRoving, setMobileRoving] = useState<number>(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const dockRef = useRef<HTMLElement | null>(null);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const collapseTimer = useRef(0);
  const lastScrollY = useRef(0);

  const activeIndex = useMemo(
    () => navSections.findIndex((section) => section.id === active),
    [active],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoving(activeIndex);
    const mobileIndex = sectionShortcuts.indexOf(active as (typeof sectionShortcuts)[number]);
    setMobileRoving(mobileIndex >= 0 ? mobileIndex : 5);
  }, [activeIndex, active]);

  const scheduleCollapse = useCallback(() => {
    if (reduced) return;
    window.clearTimeout(collapseTimer.current);
    collapseTimer.current = window.setTimeout(() => {
      if (!hoverRef.current && !focusRef.current) setCondensed(true);
    }, 3000);
  }, [reduced]);

  useEffect(() => {
    scheduleCollapse();
    const onScroll = () => {
      const current = window.scrollY;
      const goingUp = current < lastScrollY.current;
      lastScrollY.current = current;
      if (goingUp) {
        setCondensed(false);
      }
      scheduleCollapse();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(collapseTimer.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, [scheduleCollapse]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!moreOpen) return;
      const target = event.target as Node;
      if (!dockRef.current?.contains(target)) setMoreOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const go = (id: SectionId, event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if ("vibrate" in navigator) navigator.vibrate?.(8);
    navigateTo(id, event.currentTarget as HTMLElement);
    setMoreOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const nav = event.currentTarget;
    const buttons = Array.from(
      nav.querySelectorAll<HTMLButtonElement>("[data-dock-button]"),
    ).filter((button) => button.offsetParent !== null);
    if (buttons.length === 0) return;
    event.preventDefault();
    const index = buttons.findIndex((button) => button === document.activeElement);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
    if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = buttons.length - 1;
    buttons[next]?.focus();
    if (nav.classList.contains("mobile-dock")) setMobileRoving(next);
    else setRoving(next);
  };

  const dockState = condensed ? " is-condensed" : "";

  return (
    <>
      <nav
        ref={dockRef}
        className={`dock${dockState} desktop-dock`}
        aria-label="Primary"
        onPointerEnter={() => {
          hoverRef.current = true;
          window.clearTimeout(collapseTimer.current);
          setCondensed(false);
        }}
        onPointerLeave={() => {
          hoverRef.current = false;
          setHoverX(null);
          scheduleCollapse();
        }}
        onFocus={() => {
          focusRef.current = true;
          window.clearTimeout(collapseTimer.current);
          setCondensed(false);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            focusRef.current = false;
            scheduleCollapse();
          }
        }}
        onKeyDown={handleKeyDown}
        onPointerMove={(event) => setHoverX(event.clientX)}
      >
        <div className="dock__track">
          {navSections.map((section, index) => {
            const Icon = icons[section.id];
            return (
              <DockIcon
                key={section.id}
                icon={Icon}
                label={section.label}
                active={active === section.id}
                current={active === section.id}
                progress={progress}
                hoverX={condensed ? null : hoverX}
                scaleFactor={!condensed}
                tooltip={false}
                onClick={(event) => go(section.id, event)}
                onHover={() => {}}
                tabIndex={roving === index ? 0 : -1}
                onFocus={() => setRoving(index)}
              />
            );
          })}
          <span className="dock__divider" aria-hidden="true" />
          <DockIcon
            icon={Search}
            label="Command palette"
            hoverX={condensed ? null : hoverX}
            scaleFactor={!condensed}
            tooltip={false}
            onClick={(event) => {
              event.stopPropagation();
              openPalette();
            }}
            onHover={() => {}}
            tabIndex={roving === 8 ? 0 : -1}
            onFocus={() => setRoving(8)}
          >
            <span className="dock__hint" aria-hidden="true">/</span>
          </DockIcon>
        </div>
      </nav>

      <nav
        className="dock mobile-dock"
        aria-label="Primary"
        onKeyDown={handleKeyDown}
      >
        <div className="dock__mobile-track">
          {sectionShortcuts.map((id, index) => {
            const Icon = icons[id];
            return (
              <button
                key={id}
                type="button"
                className={`dock__mobile-item${active === id ? " is-active" : ""}`}
                aria-label={labelFor(id)}
                aria-current={active === id ? "true" : undefined}
                data-dock-button
                tabIndex={mobileRoving === index ? 0 : -1}
                onFocus={() => setMobileRoving(index)}
                onClick={(event) => go(id, event)}
              >
                <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                {active === id && <span className="dock__mobile-dot" aria-hidden="true" />}
              </button>
            );
          })}
          <button
            type="button"
            className={`dock__mobile-item${moreOpen ? " is-open" : ""}`}
            aria-label={moreOpen ? "Close more navigation" : "More navigation"}
            aria-expanded={moreOpen}
            data-dock-button
            tabIndex={mobileRoving === 5 ? 0 : -1}
            onFocus={() => setMobileRoving(5)}
            onClick={() => setMoreOpen((open) => !open)}
          >
            {moreOpen ? (
              <X size={20} strokeWidth={1.7} aria-hidden="true" />
            ) : (
              <MoreHorizontal size={20} strokeWidth={1.7} aria-hidden="true" />
            )}
          </button>
        </div>
        <div className={`dock__fan${moreOpen ? " is-open" : ""}`}>
          {moreShortcuts.map((id, index) => {
            const Icon = icons[id];
            return (
              <button
                key={id}
                type="button"
                className="dock__fan-item"
                style={{ ["--fan-index" as string]: index }}
                aria-label={labelFor(id)}
                tabIndex={moreOpen ? 0 : -1}
                onClick={(event) => go(id, event)}
              >
                <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                <span>{labelFor(id)}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="dock__fan-item"
            style={{ ["--fan-index" as string]: 3 }}
            aria-label="Command palette"
            tabIndex={moreOpen ? 0 : -1}
            onClick={() => {
              openPalette();
              setMoreOpen(false);
            }}
          >
            <Search size={18} strokeWidth={1.7} aria-hidden="true" />
            <span>Command</span>
          </button>
        </div>
      </nav>
    </>
  );
}
