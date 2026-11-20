"use client";

import { motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/content";
import { useBodyLock, useFocusTrap, useReducedMotion } from "@/lib/hooks";
import Gallery from "../Gallery";

const QAPipeline = dynamic(() => import("./QAPipeline"), { ssr: false });
const BPMNDiagram = dynamic(() => import("./BPMNDiagram"), { ssr: false });
const NumeralScene = dynamic(() => import("./NumeralScene"), { ssr: false });

type ProjectSceneProps = {
  project: Project;
  onClose: () => void;
  coverRef: RefObject<HTMLDivElement | null>;
};

export default function ProjectScene({ project, onClose, coverRef }: ProjectSceneProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  useBodyLock(true);
  useFocusTrap(sheetRef, true, onClose);

  const diagram =
    project.scene === "qa" ? (
      <QAPipeline />
    ) : project.scene === "bpmn" ? (
      <BPMNDiagram />
    ) : (
      <NumeralScene />
    );

  const links = project.links.filter((link) => link.href.trim().length > 0);

  return createPortal(
    <motion.div
      className="scene"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`scene-title-${project.id}`}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.26 }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="scene__close glass glass--pill"
        onClick={onClose}
        aria-label="Close project"
      >
        <X size={19} strokeWidth={1.7} aria-hidden="true" />
        <span className="mono">ESC</span>
      </button>
      <motion.div
        ref={sheetRef}
        className="scene__sheet glass"
        initial={reduced ? false : { opacity: 0, y: 42, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.985 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 28, mass: 0.85 }
        }
      >
        <div className="scene__head">
          <div className="scene__head-meta">
            <span className="mono">
              {project.number} / {project.year}
            </span>
            <span className="mono">{project.month}</span>
          </div>
          <h2 id={`scene-title-${project.id}`} className="scene__title display">
            {project.title}
          </h2>
          <div className="scene__tags">
            {project.stack.map((tag) => (
              <span key={tag} className="mono">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="scene__grid">
          <div className="scene__diagram" aria-describedby={`scene-text-${project.id}`}>
            {diagram}
          </div>
          <div
            className="scene__panel glass glass--text"
            id={`scene-text-${project.id}`}
          >
            <p className="scene__phrase serif">{project.phrase}</p>
            <ul className="scene__bullets">
              {project.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {links.length > 0 && (
              <div className="scene__links">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="scene__link"
                    data-cursor="open"
                  >
                    {link.label}
                    <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="scene__photos">
          <div className="scene__photos-head mono">
            <span>Photo stack</span>
            <span>DRAG · CLICK TO OPEN</span>
          </div>
          <Gallery
            slots={[project.cover, ...project.details]}
            coverRef={coverRef}
            label={`${project.title} photos`}
          />
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
