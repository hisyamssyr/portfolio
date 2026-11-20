"use client";

import { Braces, Shapes, Sparkles, Wrench, X } from "lucide-react";
import type Matter from "matter-js";
import { useEffect, useRef, useState } from "react";
import {
  experience,
  organizations,
  projects,
  skillGroups,
  skills,
  type Skill,
  type SkillGroup,
} from "@/content";
import { cx } from "@/lib/cx";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { onFrame } from "@/lib/raf";
import { useSkillFocus } from "../providers";
import { SplitHeading } from "../SplitText";

const groupIcon = {
  Languages: Braces,
  "Data Science & AI": Sparkles,
  "Data & Tools": Wrench,
  Other: Shapes,
};

const groupClass: Record<SkillGroup, string> = {
  Languages: "skill-pill--lang",
  "Data Science & AI": "skill-pill--ds",
  "Data & Tools": "skill-pill--tools",
  Other: "skill-pill--other",
};

function linkedNames(skill: Skill): string[] {
  return skill.links.map((link) => {
    if (link.kind === "project") {
      return projects.find((project) => project.id === link.id)?.title ?? link.id;
    }
    if (link.kind === "experience") {
      return experience.find((role) => role.id === link.id)?.role ?? link.id;
    }
    return organizations.find((org) => org.id === link.id)?.role ?? link.id;
  });
}

type DragState = {
  id: string;
  body: Matter.Body;
  offsetX: number;
  offsetY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  moved: boolean;
};

export default function Skills() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.06 });
  const reduced = useReducedMotion();
  const { focused, focusSkill } = useSkillFocus();
  const [filter, setFilter] = useState<SkillGroup | "All">("All");
  const [ready, setReady] = useState(false);
  const pileRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const sim = useRef<{
    engine: Matter.Engine;
    ground: Matter.Body;
    left: Matter.Body;
    right: Matter.Body;
    bodies: Map<string, Matter.Body>;
    sizes: Map<string, { w: number; h: number }>;
    unsubscribe: (() => void) | null;
    visible: boolean;
  } | null>(null);
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef<string | null>(null);

  useEffect(() => {
    if (!inView || reduced || sim.current) return;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const init = async () => {
      const pile = pileRef.current;
      if (!pile) return;
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      const matterModule = await import("matter-js");
      const M = (matterModule as unknown as { default?: typeof import("matter-js") }).default
        ? (matterModule as unknown as { default: typeof import("matter-js") }).default
        : (matterModule as unknown as typeof import("matter-js"));
      if (cancelled) return;

      const rect = pile.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const engine = M.Engine.create();
      engine.gravity.y = 1;
      const floor = 94;
      const ground = M.Bodies.rectangle(width / 2, height - floor + 30, width * 2, 60, {
        isStatic: true,
        friction: 0.8,
      });
      const left = M.Bodies.rectangle(-30, height / 2, 60, height * 2, { isStatic: true });
      const right = M.Bodies.rectangle(width + 30, height / 2, 60, height * 2, { isStatic: true });
      M.Composite.add(engine.world, [ground, left, right]);

      const bodies = new Map<string, Matter.Body>();
      const sizes = new Map<string, { w: number; h: number }>();
      skills.forEach((skill, index) => {
        const el = pillRefs.current.get(skill.id);
        if (!el) return;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        sizes.set(skill.id, { w, h });
        const x = 12 + ((index * 97) % Math.max(1, width - 24));
        const body = M.Bodies.rectangle(x, -h - index * 34, w, h, {
          angle: 0,
          inertia: Infinity,
          restitution: 0.18,
          friction: 0.55,
          frictionAir: 0.012,
          chamfer: { radius: Math.min(h / 2, 18) },
        });
        bodies.set(skill.id, body);
        M.Composite.add(engine.world, body);
        el.style.visibility = "visible";
        el.style.zIndex = "1";
      });

      const paint = () => {
        bodies.forEach((body, id) => {
          const el = pillRefs.current.get(id);
          const size = sizes.get(id);
          if (!el || !size) return;
          el.style.transform = `translate3d(${body.position.x - size.w / 2}px, ${
            body.position.y - size.h / 2
          }px, 0) rotate(${body.angle}rad)`;
        });
      };

      let lastTime = 0;
      const step = (time: number) => {
        if (!sim.current?.visible) {
          lastTime = time;
          return;
        }
        if (!lastTime) lastTime = time;
        const delta = Math.min(240, Math.max(8, time - lastTime));
        lastTime = time;
        const steps = Math.min(12, Math.max(1, Math.round(delta / 16.667)));
        const slice = delta / steps;
        for (let index = 0; index < steps; index += 1) {
          M.Engine.update(engine, slice);
        }
        paint();
      };

      const start = () => {
        if (sim.current?.unsubscribe) return;
        const unsubscribe = onFrame(step);
        lastTime = 0;
        if (sim.current) sim.current.unsubscribe = unsubscribe;
      };

      const stop = () => {
        sim.current?.unsubscribe?.();
        if (sim.current) sim.current.unsubscribe = null;
      };

      sim.current = {
        engine,
        ground,
        left,
        right,
        bodies,
        sizes,
        unsubscribe: null,
        visible: true,
      };


      const onMove = (event: PointerEvent) => {
        const state = drag.current;
        const pileNode = pileRef.current;
        if (!state || !pileNode) return;
        const bounds = pileNode.getBoundingClientRect();
        const x = Math.min(
          bounds.width - state.offsetX - 4,
          Math.max(state.offsetX + 4, event.clientX - bounds.left),
        );
        const y = Math.min(
          bounds.height - state.offsetY - 4,
          Math.max(state.offsetY + 4, event.clientY - bounds.top),
        );
        M.Body.setPosition(state.body, { x, y });
        M.Body.setVelocity(state.body, { x: 0, y: 0 });
        if (Math.hypot(event.clientX - state.lastX, event.clientY - state.lastY) > 3) {
          state.moved = true;
        }
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        state.lastTime = event.timeStamp;
      };

      const onUp = (event: PointerEvent) => {
        const state = drag.current;
        if (!state) return;
        const vx = (event.clientX - state.lastX) * 0.9;
        const vy = (event.clientY - state.lastY) * 0.9;
        M.Body.setVelocity(state.body, {
          x: Math.max(-32, Math.min(32, vx)),
          y: Math.max(-32, Math.min(32, vy)),
        });
        M.Body.setAngularVelocity(state.body, Math.max(-0.08, Math.min(0.08, vx * 0.006)));
        if (state.moved) {
          suppressClick.current = state.id;
          window.setTimeout(() => {
            if (suppressClick.current === state.id) suppressClick.current = null;
          }, 350);
        }
        drag.current = null;
      };

      const onResize = () => {
        const now = pileRef.current?.getBoundingClientRect();
        if (!now) return;
        M.Body.setPosition(ground, { x: now.width / 2, y: now.height - 94 + 30 });
        M.Body.setPosition(left, { x: -30, y: now.height / 2 });
        M.Body.setPosition(right, { x: now.width + 30, y: now.height / 2 });
        bodies.forEach((body) => {
          if (body.position.x > now.width + 40 || body.position.x < -40) {
            M.Body.setPosition(body, {
              x: Math.max(20, Math.min(now.width - 20, now.width / 2)),
              y: 40,
            });
          }
        });
      };

      observer = new IntersectionObserver(
        ([entry]) => {
          if (sim.current) sim.current.visible = entry.isIntersecting;
          if (entry.isIntersecting) start();
          else stop();
        },
        { threshold: 0.04 },
      );
      observer.observe(pile);
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(pile);

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      sim.current.unsubscribe = null;
      sim.current.visible = true;
      start();
      paint();
      setReady(true);

      (sim.current as unknown as { cleanup?: () => void }).cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        M.Engine.clear(engine);
      };
    };

    void init();

    return () => {
      cancelled = true;
      observer?.disconnect();
      resizeObserver?.disconnect();
      const cleanup = (sim.current as unknown as { cleanup?: () => void } | null)?.cleanup;
      cleanup?.();
      sim.current?.unsubscribe?.();
      sim.current = null;
      setReady(false);
    };
  }, [inView, reduced]);

  useEffect(() => {
    if (!sim.current) return;
    sim.current.bodies.forEach((body, id) => {
      const skill = skills.find((item) => item.id === id);
      const el = pillRefs.current.get(id);
      if (!skill || !el) return;
      const match = filter === "All" || skill.group === filter;
      el.style.zIndex = match ? "4" : "1";
      el.style.opacity = match ? "1" : "0.35";
    });
  }, [filter]);

  const filterSkill = (group: SkillGroup | "All") => {
    setFilter(group);
    const current = sim.current;
    if (!current) return;
    skills.forEach((skill) => {
      const body = current.bodies.get(skill.id);
      if (!body) return;
      const match = group === "All" || skill.group === group;
      if (match) {
        void import("matter-js").then((matter) => {
          const M = (matter as unknown as { default?: typeof import("matter-js") }).default
            ? (matter as unknown as { default: typeof import("matter-js") }).default
            : (matter as unknown as typeof import("matter-js"));
          M.Sleeping.set(body, false);
          M.Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * body.mass * 0.002,
            y: -body.mass * 0.022,
          });
          M.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04);
        });
      }
    });
  };

  const onPillDown = (event: React.PointerEvent<HTMLButtonElement>, skill: Skill) => {
    if (reduced) return;
    const current = sim.current;
    const body = current?.bodies.get(skill.id);
    const size = current?.sizes.get(skill.id);
    const pile = pileRef.current;
    if (!current || !body || !size || !pile) return;
    event.preventDefault();
    const rect = pile.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    void import("matter-js").then((matter) => {
      const M = (matter as unknown as { default?: typeof import("matter-js") }).default
        ? (matter as unknown as { default: typeof import("matter-js") }).default
        : (matter as unknown as typeof import("matter-js"));
      M.Sleeping.set(body, false);
    });
    drag.current = {
      id: skill.id,
      body,
      offsetX: x - (body.position.x - size.w / 2),
      offsetY: y - (body.position.y - size.h / 2),
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      moved: false,
    };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  };

  const onPillClick = (skill: Skill) => {
    if (suppressClick.current === skill.id) {
      suppressClick.current = null;
      return;
    }
    if (skill.links.length === 0) return;
    focusSkill(focused?.id === skill.id ? null : skill);
  };

  const selectFromList = (skill: Skill) => {
    if (skill.links.length === 0) return;
    focusSkill(focused?.id === skill.id ? null : skill);
  };

  const selectedId = focused?.id ?? null;

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="section-inner">
        <div className="section-eyebrow">
          <span className="section-eyebrow__dot" aria-hidden="true" />
          <span className="label">06 / SKILLS</span>
        </div>
        <div className="skills__head">
          <SplitHeading
            text="SKILLS"
            as="h2"
            className="section-title skills__title display"
            ariaLabel="Skills"
          />
          <span
            className="skills__echo display outline-type"
            aria-hidden="true"
            data-parallax="4"
          >
            GRAVITY
          </span>
          <p className="skills__note mono">
            DROP · GRAB · THROW · SELECT A SKILL TO FIND WHERE IT IS USED
          </p>
          <div className="skills__filters" role="group" aria-label="Filter skills by category">
            {(["All", ...skillGroups] as const).map((group) => (
              <button
                key={group}
                type="button"
                className={cx("skills__filter mono", filter === group && "is-active")}
                onClick={() => filterSkill(group)}
                aria-pressed={filter === group}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={ref}
          className={cx(
            "skills__pile-wrap",
            ready && "is-ready",
            reduced && "is-static",
          )}
        >
          <div ref={pileRef} className="skills__pile" aria-hidden="true">
            {skills.map((skill) => {
              const Icon = groupIcon[skill.group];
              return (
                <button
                  key={skill.id}
                  type="button"
                  tabIndex={-1}
                  ref={(node) => {
                    if (node) pillRefs.current.set(skill.id, node);
                    else pillRefs.current.delete(skill.id);
                  }}
                  className={cx(
                    "skill-pill",
                    groupClass[skill.group],
                    filter !== "All" && skill.group !== filter && "is-filtered",
                    selectedId === skill.id && "is-selected",
                  )}
                  onPointerDown={(event) => onPillDown(event, skill)}
                  onClick={() => onPillClick(skill)}
                  data-cursor={skill.links.length > 0 ? "view" : undefined}
                >
                  <Icon size={12} strokeWidth={1.8} aria-hidden="true" />
                  <span>{skill.label}</span>
                </button>
              );
            })}
          </div>
          {!ready && !reduced && <span className="skills__loading mono">LOADING GRAVITY…</span>}
        </div>

        {focused && (
          <div className="skills__focus glass" role="status">
            <span className="mono">
              {focused.label} APPEARS IN
            </span>
            <p className="skills__focus-names">{linkedNames(focused).join(" · ")}</p>
            <button
              type="button"
              className="skills__focus-clear"
              onClick={() => focusSkill(null)}
              aria-label="Clear skill focus"
            >
              <X size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        )}

        <details className="skills__list">
          <summary className="mono">SKILL LIST / ACCESSIBLE VIEW</summary>
          <div className="skills__list-groups">
            {skillGroups.map((group) => (
              <div key={group} className="skills__list-group">
                <h3 className="mono">{group}</h3>
                <ul>
                  {skills
                    .filter((skill) => skill.group === group)
                    .map((skill) =>
                      skill.links.length > 0 ? (
                        <li key={skill.id}>
                          <button
                            type="button"
                            className={cx(selectedId === skill.id && "is-selected")}
                            onClick={() => selectFromList(skill)}
                            aria-pressed={selectedId === skill.id}
                          >
                            {skill.label}
                            <span className="mono"> — {linkedNames(skill).join(", ")}</span>
                          </button>
                        </li>
                      ) : (
                        <li key={skill.id}>{skill.label}</li>
                      ),
                    )}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
