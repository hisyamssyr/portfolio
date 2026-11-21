"use client";

import { Database, Network, Shapes, Waypoints } from "lucide-react";
import { skillGroups, skills, type Skill } from "@/content";
import { SplitHeading } from "../SplitText";
import { skillMarks } from "../skillMarks";

const marqueeRows = [
  ["python", "sql", "go", "cpp", "php", "node"],
  [
    "tensorflow",
    "llm",
    "multiagent",
    "rag",
    "playwright",
    "docker",
    "looker",
    "git",
    "figma",
  ],
];

const marqueeSkills = marqueeRows.map((ids) =>
  ids
    .map((id) => skills.find((skill) => skill.id === id))
    .filter((skill): skill is Skill => Boolean(skill)),
);

const skillGlyphs: Record<string, typeof Database> = {
  sql: Database,
  multiagent: Network,
  rag: Waypoints,
};

function SkillMark({ skill }: { skill: Skill }) {
  const mark = skillMarks[skill.id];
  if (mark) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="skills-marquee__mark"
        style={{ "--brand": mark.color } as React.CSSProperties}
      >
        <path d={mark.path} fill="currentColor" />
      </svg>
    );
  }
  const Glyph = skillGlyphs[skill.id] ?? Shapes;
  return (
    <Glyph
      className="skills-marquee__mark skills-marquee__mark--glyph"
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}

function MarqueeItem({ skill }: { skill: Skill }) {
  return (
    <span className="skills-marquee__item">
      <SkillMark skill={skill} />
      <span>{skill.label}</span>
    </span>
  );
}

function MarqueeGroup({ items, hidden }: { items: Skill[]; hidden: boolean }) {
  return (
    <div className="skills-marquee__group" aria-hidden={hidden || undefined}>
      {items.map((skill) => (
        <MarqueeItem key={skill.id} skill={skill} />
      ))}
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="section-inner">
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
            STACK
          </span>
        </div>

        <div
          className="skills-marquee"
          role="group"
          aria-label="Technical skill stack"
        >
          {marqueeSkills.map((row, rowIndex) => (
            <div className="skills-marquee__row" key={rowIndex}>
              <div className="skills-marquee__track">
                {[false, true].map((hidden) => (
                  <MarqueeGroup
                    key={hidden ? "copy" : "main"}
                    items={row}
                    hidden={hidden}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <details className="skills__list">
          <summary className="mono">SKILL LIST / ACCESSIBLE VIEW</summary>
          <div className="skills__list-groups">
            {skillGroups.map((group) => (
              <div key={group} className="skills__list-group">
                <h3 className="mono">{group}</h3>
                <ul>
                  {skills
                    .filter((skill) => skill.group === group)
                    .map((skill) => (
                      <li key={skill.id}>{skill.label}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
