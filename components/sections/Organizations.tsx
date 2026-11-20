"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useState } from "react";
import { organizations } from "@/content";
import { cx } from "@/lib/cx";
import { useReducedMotion } from "@/lib/hooks";
import Gallery from "../Gallery";
import OrgCanvas from "../orgs/OrgCanvas";
import { Photo } from "../Photo";
import { useSkillFocus } from "../providers";
import { SplitHeading } from "../SplitText";

const sceneLabels: Record<string, string> = {
  ramadan:
    "15+ vendors → hub → 700+ daily participants · 25+ staff orbit",
  schematics:
    "Registration → spreadsheet SQL → Looker Studio → bulk messaging / email",
  hmtc: "Siapin Karirmu · Oracle + Telkom visits (60 participants) · Benchmarking",
};

const islandMeta: Record<string, { tilt: number; className: string }> = {
  hmtc: { tilt: -2.1, className: "org-island--hmtc" },
  schematics: { tilt: 1.4, className: "org-island--schematics" },
  ramadan: { tilt: -1.3, className: "org-island--ramadan" },
};

export default function Organizations() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const { focused } = useSkillFocus();
  const reduced = useReducedMotion();
  const active = organizations.find((org) => org.id === activeId) ?? null;

  return (
    <section
      id="organizations"
      className="section organizations"
      aria-labelledby="organizations-title"
    >
      <div className="section-inner">
        <div className="section-eyebrow">
          <span className="section-eyebrow__dot" aria-hidden="true" />
          <span className="label">05 / ORGANIZATIONS</span>
        </div>
        <div className="organizations__head">
          <SplitHeading
            text="ORGANIZATIONS"
            as="h2"
            className="section-title organizations__title display"
            ariaLabel="Organizations"
          />
          <span className="organizations__echo display outline-type" aria-hidden="true">
            ISLANDS
          </span>
          <p className="organizations__note mono">
            THREE ISLANDS · HOVER TO PAUSE · CLICK TO OPEN
          </p>
        </div>

        <div className="organizations__islands">
          {organizations.map((org) => {
            const meta = islandMeta[org.id];
            const linked = focused?.links.some(
              (link) => link.kind === "org" && link.id === org.id,
            );
            const dimmed = Boolean(focused) && !linked;
            return (
              <article
                key={org.id}
                className={cx(
                  "org-island",
                  meta.className,
                  linked && "is-linked",
                  dimmed && "dimmed",
                )}
                style={{ rotate: `${meta.tilt}deg` }}
              >
                <button
                  type="button"
                  className="org-island__button"
                  onClick={() => setActiveId(activeId === org.id ? null : org.id)}
                  onPointerEnter={() => setHoverId(org.id)}
                  onPointerLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(org.id)}
                  onBlur={() => setHoverId(null)}
                  aria-expanded={activeId === org.id}
                  aria-controls={`org-${org.id}`}
                  data-cursor="view"
                >
                  <div className="org-island__glass glass">
                    <div className="org-island__scene">
                      <OrgCanvas
                        mode={org.scene}
                        paused={hoverId === org.id || activeId === org.id}
                      />
                      <div
                        className={cx(
                          "org-island__legend mono",
                          hoverId === org.id && "is-visible",
                        )}
                      >
                        {sceneLabels[org.id]}
                      </div>
                    </div>
                    <div className="org-island__photo">
                      <Photo
                        slot={org.cover}
                        sizes="(max-width: 640px) 60vw, 280px"
                        className="org-island__cover"
                      />
                    </div>
                    <div className="org-island__meta">
                      <span className="mono">{org.dates}</span>
                      <h3 className="org-island__title display">{org.role}</h3>
                      <p className="org-island__org">{org.org}</p>
                      <ul className="org-island__stats">
                        {org.stats.map((stat) => (
                          <li key={stat} className="mono">
                            {stat}
                          </li>
                        ))}
                      </ul>
                      <span className="org-island__open mono">
                        {activeId === org.id ? "CLOSE" : "OPEN"} ↗
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>

        <AnimatePresence initial={false} mode="wait">
          {active && (
            <motion.div
              key={active.id}
              id={`org-${active.id}`}
              className="org-panel glass glass--text"
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 220, damping: 28 }
              }
            >
              <div className="org-panel__head">
                <div>
                  <span className="mono">
                    {active.dates} · {active.org}
                  </span>
                  <h3 className="org-panel__title display">{active.role}</h3>
                </div>
                <button
                  type="button"
                  className="org-panel__close glass glass--pill"
                  onClick={() => setActiveId(null)}
                  aria-label="Close organization details"
                >
                  <X size={17} strokeWidth={1.7} aria-hidden="true" />
                </button>
              </div>
              <div className="org-panel__body">
                <ul className="org-panel__bullets">
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
