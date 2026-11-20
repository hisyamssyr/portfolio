"use client";

import { useRef, useState } from "react";
import { education } from "@/content";
import { cx } from "@/lib/cx";
import { SplitHeading } from "../SplitText";

const pathD =
  "M 24 252 C 120 120, 250 112, 360 232 S 470 316, 556 212 C 646 102, 752 84, 852 184 S 936 248, 976 206";

const markers = [
  { id: "sman1", x: 222, y: 149, length: 0.2 },
  { id: "its", x: 754, y: 121, length: 0.75 },
];

export default function Education() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState({ x: 796, y: 132 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hitRef = useRef<SVGPathElement | null>(null);
  const active = education.find((entry) => entry.id === activeId) ?? null;

  const scrub = (event: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const path = hitRef.current;
    if (!svg || !path) return;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 1000;
    const y = ((event.clientY - rect.top) / rect.height) * 340;
    const total = path.getTotalLength();
    let best = { distance: Infinity, point: { x: 0, y: 0 }, t: 0 };
    for (let index = 0; index <= 80; index += 1) {
      const point = path.getPointAtLength((index / 80) * total);
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < best.distance) {
        best = { distance, point, t: index / 80 };
      }
    }
    if (best.distance > 170) return;
    setAnchor({ x: best.point.x, y: best.point.y });
    setActiveId(best.t < 0.5 ? "sman1" : "its");
  };

  const pick = (id: string) => {
    const marker = markers.find((item) => item.id === id);
    if (!marker) return;
    setAnchor({ x: marker.x, y: marker.y });
    setActiveId(id);
  };

  return (
    <section
      id="education"
      className="section education"
      aria-labelledby="education-title"
    >
      <div className="section-inner">
        <div className="section-eyebrow">
          <span className="section-eyebrow__dot" aria-hidden="true" />
          <span className="label">07 / EDUCATION</span>
        </div>
        <div className="education__head">
          <SplitHeading
            text="EDUCATION"
            as="h2"
            className="section-title education__title display"
            ariaLabel="Education"
          />
          <span
            className="education__echo display outline-type"
            aria-hidden="true"
            data-parallax="5"
          >
            LEARNING
          </span>
          <p className="education__note mono">
            SCRUB THE LINE · TWO SWELLS · TWO SCHOOLS
          </p>
        </div>

        <div className="education__stage">
          <div className="education__canvas">
          <svg
            ref={svgRef}
            className="education__svg"
            viewBox="0 0 1000 340"
            preserveAspectRatio="none"
            role="img"
            aria-label="A luminous wavy line with two swells. First: SMA Negeri 1 Srengat, July 2021 to May 2024, score 87.60 out of 100.00, Blitar. Second: Institut Teknologi Sepuluh Nopember, August 2024 to August 2028 expected, Bachelor of Informatics, GPA 3.49 out of 4.00, Surabaya."
            onPointerMove={scrub}
            onPointerLeave={() => setActiveId(null)}
          >
            <path className="education__ghost" d={pathD} />
            <path className="education__line" d={pathD} />
            <path
              ref={hitRef}
              className="education__hit"
              d={pathD}
              fill="none"
              stroke="transparent"
              strokeWidth="58"
              strokeLinecap="round"
              data-cursor="view"
            />
            {markers.map((marker) => (
              <circle
                key={marker.id}
                cx={marker.x}
                cy={marker.y}
                r={activeId === marker.id ? 7 : 4}
                className={cx(
                  "education__dot",
                  activeId === marker.id && "is-active",
                )}
              />
            ))}
          </svg>

          {markers.map((marker) => {
            const entry = education.find((item) => item.id === marker.id);
            if (!entry) return null;
            return (
              <button
                key={marker.id}
                type="button"
                className="education__marker"
                style={{
                  left: `${(marker.x / 1000) * 100}%`,
                  top: `${(marker.y / 340) * 100}%`,
                }}
                onClick={() => pick(marker.id)}
                onPointerEnter={() => pick(marker.id)}
                onFocus={() => pick(marker.id)}
                aria-label={`${entry.school}, ${entry.dates}, ${entry.scoreLabel} ${entry.score}`}
                aria-expanded={activeId === marker.id}
                data-cursor="view"
              >
                <span className="mono">{entry.id === "its" ? "ITS" : "SMAN 1"}</span>
              </button>
            );
          })}

          {!active && (
            <div className="education__prompt glass mono">
              Move along the line to open the years
            </div>
          )}

          {active && (
            <div
              key={active.id}
              className="education__tooltip glass glass--text"
              style={{
                left: `${(anchor.x / 1000) * 100}%`,
                top: `${(anchor.y / 340) * 100}%`,
              }}
              role="status"
            >
              <span className="mono">{active.dates}</span>
              <h3 className="education__school display">{active.school}</h3>
              <p className="education__level serif">{active.level}</p>
              <div className="education__score">
                <span className="mono">{active.scoreLabel}</span>
                <span className="display">{active.score}</span>
              </div>
              <span className="mono">{active.location}</span>
            </div>
          )}

          </div>
          <div className="sr-only">
            {education.map((entry) => (
              <article key={entry.id} id={`edu-text-${entry.id}`}>
                <h3>{entry.school}</h3>
                <p>
                  {entry.level} · {entry.dates} · {entry.scoreLabel} {entry.score} ·{" "}
                  {entry.location}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
