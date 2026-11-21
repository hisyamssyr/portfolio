"use client";

import { AnimatePresence, motion, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Flip } from "gsap/Flip";
import { projects, type Project } from "@/content";
import { cx } from "@/lib/cx";
import { useReducedMotion } from "@/lib/hooks";
import { Photo } from "../Photo";
import { SplitHeading } from "../SplitText";
import ProjectScene from "../projects/ProjectScene";

function ProjectObject({
  project,
  index,
  onOpen,
  coverRef,
  buttonRef,
  tabIndex,
  onFocus,
  open,
}: {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
  coverRef: (node: HTMLDivElement | null) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
  tabIndex: number;
  onFocus: () => void;
  open: boolean;
}) {
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 130, damping: 18 });
  const y = useSpring(0, { stiffness: 130, damping: 18 });
  const scale = useSpring(1, { stiffness: 170, damping: 20 });

  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(px * 18);
    y.set(py * 14);
    scale.set(1.018);
  };

  const leave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  return (
    <motion.article
      className={cx("project-object", `project-object--${index + 1}`)}
      style={{ rotate: `${project.id === "bpmn-agent" ? 1.8 : project.id === "numeral-classification" ? -2.6 : -1.2}deg` }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="project-object__button"
        onClick={() => onOpen(project)}
        onPointerMove={move}
        onPointerLeave={leave}
        onFocus={onFocus}
        tabIndex={tabIndex}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <motion.div
          className="project-object__blob"
          style={{ x, y, scale }}
        >
          <div className="project-object__photo" ref={coverRef}>
            <Photo
              slot={project.cover}
              sizes="(max-width: 640px) 88vw, (max-width: 1024px) 64vw, 48vw"
              className="project-object__image"
            />
          </div>
          <span className="project-object__vignette" aria-hidden="true" />
          <span className="project-object__specular" aria-hidden="true" />
        </motion.div>

        <div className="project-object__info">
          <div className="project-object__index mono">
            <span>{project.number}</span>
            <span>{project.year}</span>
          </div>
          <h3 className="project-object__title display">{project.title}</h3>
          <ul className="project-object__stack">
            {project.stack.map((tag) => (
              <li key={tag} className="mono">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </button>
    </motion.article>
  );
}

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const [roving, setRoving] = useState(0);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sceneCoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const flip = useRef<Flip.FlipState | null>(null);
  const reduced = useReducedMotion();

  const openProject = async (project: Project) => {
    const node = cardRefs.current[project.id];
    if (node && !reduced) {
      try {
        const [{ default: gsap }, { Flip }] = await Promise.all([
          import("gsap"),
          import("gsap/Flip"),
        ]);
        gsap.registerPlugin(Flip);
        flip.current = Flip.getState(node);
      } catch {
        flip.current = null;
      }
    }
    setOpen(project);
  };

  useEffect(() => {
    const state = flip.current;
    if (!open || !state) return;
    let cancelled = false;
    const run = async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const target = sceneCoverRef.current;
      if (cancelled || !target) return;
      try {
        const [{ default: gsap }, { Flip }] = await Promise.all([
          import("gsap"),
          import("gsap/Flip"),
        ]);
        gsap.registerPlugin(Flip);
        Flip.from(state, {
          targets: target,
          duration: 0.55,
          ease: "power3.out",
          absolute: true,
          scale: true,
        });
      } catch {
        /* noop */
      }
      flip.current = null;
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const close = () => setOpen(null);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const buttons = buttonRefs.current.filter(Boolean) as HTMLButtonElement[];
      const current = buttons.findIndex((button) => button === document.activeElement);
      if (current === -1) return;
      let next = current;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = (current + 1) % buttons.length;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = (current - 1 + buttons.length) % buttons.length;
      }
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = buttons.length - 1;
      setRoving(next);
      buttons[next]?.focus();
    }
  };

  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="section-inner">
        <div className="projects__head">
          <SplitHeading
            text="PROJECTS"
            as="h2"
            className="section-title projects__title display"
            ariaLabel="Projects"
          />
          <span
            className="projects__echo display outline-type"
            aria-hidden="true"
            data-parallax="7"
          >
            PROJECTS
          </span>
        </div>

        <div
          className="projects__collage"
          onKeyDown={onKeyDown}
          role="group"
          aria-label="Project objects"
        >
          {projects.map((project, index) => (
            <ProjectObject
              key={project.id}
              project={project}
              index={index}
              onOpen={openProject}
              coverRef={(node) => {
                cardRefs.current[project.id] = node;
              }}
              buttonRef={(node) => {
                buttonRefs.current[index] = node;
              }}
              tabIndex={roving === index ? 0 : -1}
              onFocus={() => setRoving(index)}
              open={open?.id === project.id}
            />
          ))}
          <span className="projects__orbit" aria-hidden="true" data-parallax="-5" />
          <span
            className="projects__orbit projects__orbit--b"
            aria-hidden="true"
            data-parallax="9"
          />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <ProjectScene
            key={open.id}
            project={open}
            onClose={close}
            coverRef={sceneCoverRef}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
