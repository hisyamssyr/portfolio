"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { experience } from "@/content";
import { cx } from "@/lib/cx";
import {
  useCountUp,
  useInView,
  useOnceInView,
  useReducedMotion,
} from "@/lib/hooks";
import { onFrame } from "@/lib/raf";
import Gallery from "../Gallery";
import { Photo } from "../Photo";
import { useSkillFocus } from "../providers";
import { SplitHeading } from "../SplitText";

const WIDTH = 1000;
const HEIGHT = 340;
const anchors = [
  { x: 0, y: 238 },
  { x: 150, y: 186 },
  { x: 430, y: 262 },
  { x: 800, y: 152 },
  { x: 1000, y: 216 },
];

const knotPositions = [
  { id: "robocon", x: 150, y: 186 },
  { id: "ta-database", x: 800, y: 152 },
];

function buildPath(offsets: number[]) {
  const [a, b, c, d, e] = anchors.map((anchor, index) => ({
    x: anchor.x,
    y: anchor.y + offsets[index],
  }));
  return [
    `M ${a.x} ${a.y}`,
    `C ${a.x + 70} ${a.y}, ${b.x - 70} ${b.y}, ${b.x} ${b.y}`,
    `C ${b.x + 110} ${b.y}, ${c.x - 120} ${c.y}, ${c.x} ${c.y}`,
    `C ${c.x + 120} ${c.y}, ${d.x - 130} ${d.y}, ${d.x} ${d.y}`,
    `C ${d.x + 70} ${d.y}, ${e.x - 40} ${e.y}, ${e.x} ${e.y}`,
  ].join(" ");
}

function Counter({ value, label }: { value: number; label: string }) {
  const [ref, seen] = useOnceInView<HTMLSpanElement>({ threshold: 0.6 });
  const count = useCountUp(value, seen);
  return (
    <span ref={ref} className="experience__counter glass">
      <span className="experience__counter-num display">{count}</span>
      <span className="mono">{label}</span>
    </span>
  );
}

export default function Experience() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const [sectionRef, inView] = useInView<HTMLElement>({ threshold: 0.12 });
  const { focused } = useSkillFocus();
  const reduced = useReducedMotion();
  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const limeRef = useRef<SVGPathElement | null>(null);
  const offsets = useRef(anchors.map(() => 0));
  const velocities = useRef(anchors.map(() => 0));
  const targets = useRef(anchors.map(() => 0));
  const unsubscribe = useRef<(() => void) | null>(null);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const active = experience.find((role) => role.id === activeId) ?? null;

  const paint = () => {
    const d = buildPath(offsets.current);
    pathRefs.current.forEach((path) => path?.setAttribute("d", d));
    if (limeRef.current) limeRef.current.setAttribute("d", d);
  };

  const step = () => {
    let moving = false;
    for (let index = 0; index < offsets.current.length; index += 1) {
      const force = (targets.current[index] - offsets.current[index]) * 0.14;
      velocities.current[index] = (velocities.current[index] + force) * 0.82;
      offsets.current[index] += velocities.current[index];
      if (
        Math.abs(targets.current[index] - offsets.current[index]) > 0.04 ||
        Math.abs(velocities.current[index]) > 0.04
      ) {
        moving = true;
      } else {
        offsets.current[index] = targets.current[index];
        velocities.current[index] = 0;
      }
    }
    paint();
    if (!moving && !dragging.current) {
      unsubscribe.current?.();
      unsubscribe.current = null;
    }
  };

  const startLoop = () => {
    if (unsubscribe.current) return;
    unsubscribe.current = onFrame(step);
  };

  useEffect(() => {
    paint();
    return () => {
      unsubscribe.current?.();
    };
  }, []);

  useEffect(() => {
    if (!inView || reduced) return;
    startLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  const localY = (event: React.PointerEvent) => {
    const rect = ribbonRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return ((event.clientY - rect.top) / rect.height) * HEIGHT;
  };

  const localX = (event: React.PointerEvent) => {
    const rect = ribbonRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return ((event.clientX - rect.left) / rect.width) * WIDTH;
  };

  const onDown = (event: React.PointerEvent) => {
    if (reduced) return;
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    dragging.current = true;
    setGrabbing(true);
    start.current = { x: localX(event), y: localY(event) };
    startLoop();
  };

  const onMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const x = localX(event);
    const dy = localY(event) - start.current.y;
    targets.current = anchors.map((anchor) => {
      const influence = Math.exp(-Math.pow((x - anchor.x) / 230, 2));
      return dy * influence * 0.85;
    });
  };

  const onUp = () => {
    dragging.current = false;
    setGrabbing(false);
    targets.current = anchors.map(() => 0);
    startLoop();
  };

  const rolesById = Object.fromEntries(experience.map((role) => [role.id, role]));

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="section experience"
      aria-labelledby="experience-title"
    >
      <div className="section-inner">
        <div className="experience__head">
          <SplitHeading
            text="EXPERIENCE"
            as="h2"
            className="section-title experience__title display"
            ariaLabel="Experience"
          />
          <span
            className="experience__echo display outline-type"
            aria-hidden="true"
            data-parallax="5"
          >
            TIME
          </span>
          <p className="experience__note mono">
            GRAB THE RIBBON · ARRANGED BY REAL TIME GAP
          </p>
        </div>

        <div
          ref={ribbonRef}
          className={cx("ribbon", grabbing && "is-dragging")}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
        >
          <svg
            className="ribbon__svg"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="A glass ribbon timeline with two knots: Programming Division Intern at ITS Robocon, September to October 2024, and Teaching Assistant for Database Systems at ITS, August to December 2025."
          >
            <path ref={(node) => { pathRefs.current[0] = node; }} className="ribbon__edge" />
            <path ref={(node) => { pathRefs.current[1] = node; }} className="ribbon__glass" />
            <path
              ref={(node) => { pathRefs.current[2] = node; }}
              className="ribbon__inner"
            />
            <path
              ref={limeRef}
              className="ribbon__lime"
              transform="translate(0 -30)"
            />
          </svg>
          <svg
            className="ribbon__hit"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={buildPath(anchors.map(() => 0))}
              fill="none"
              stroke="transparent"
              strokeWidth="86"
              strokeLinecap="round"
              data-cursor="drag"
              onPointerDown={onDown}
              style={{ cursor: "grab" }}
            />
          </svg>

          {knotPositions.map((position) => {
            const role = rolesById[position.id];
            const linked = focused?.links.some(
              (link) => link.kind === "experience" && link.id === role.id,
            );
            const dimmed = Boolean(focused) && !linked;
            return (
              <div
                key={position.id}
                className={cx("ribbon-knot", linked && "is-linked", dimmed && "dimmed")}
                style={{
                  left: `${(position.x / WIDTH) * 100}%`,
                  top: `${(position.y / HEIGHT) * 100}%`,
                }}
              >
                <button
                  type="button"
                  className={cx("ribbon-knot__button glass", activeId === role.id && "is-active")}
                  onClick={() => setActiveId(activeId === role.id ? null : role.id)}
                  aria-expanded={activeId === role.id}
                  aria-controls={`role-${role.id}`}
                  data-cursor="view"
                >
                  <span className="ribbon-knot__photo">
                    <Photo
                      slot={role.cover}
                      sizes="120px"
                      className="ribbon-knot__image"
                      quiet
                    />
                  </span>
                  <span className="ribbon-knot__ring" aria-hidden="true" />
                  <span className="ribbon-knot__dot" aria-hidden="true" />
                </button>
                <div className="ribbon-knot__label">
                  <span className="mono">{role.dates}</span>
                  <span className="ribbon-knot__role">{role.role}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="experience__counters">
          <Counter value={13} label="students guided" />
          <Counter value={7} label="sessions evaluated" />
          <span className="experience__counter-note mono">
            Teaching Assistant for Database Systems
          </span>
        </div>

        <AnimatePresence initial={false} mode="wait">
          {active && (
            <motion.div
              key={active.id}
              id={`role-${active.id}`}
              className="experience__panel glass glass--text"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 220, damping: 30, mass: 0.8 }
              }
              style={{ overflow: "hidden" }}
            >
              <div className="experience__panel-inner">
                <div className="experience__panel-head">
                  <div>
                    <span className="mono">{active.dates} · {active.org}</span>
                    <h3 className="experience__panel-title">{active.role}</h3>
                  </div>
                  <button
                    type="button"
                    className="experience__panel-close glass glass--pill"
                    onClick={() => setActiveId(null)}
                    aria-label="Close role details"
                  >
                    <X size={17} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                </div>
                <ul className="experience__panel-bullets">
                  {active.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <Gallery
                  slots={[active.cover, ...active.details]}
                  label={`${active.role} photos`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
