"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { useReducedMotion } from "@/lib/hooks";

const writers = Array.from({ length: 70 }, (_, index) => index);
const recipes = [
  "EMA",
  "AdamW",
  "Learning-rate scheduling",
  "Label smoothing",
  "Mixed-precision training",
];
const glyphs = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

export default function NumeralScene() {
  const [split, setSplit] = useState<"random" | "grouped">("grouped");
  const [recipe, setRecipe] = useState<string | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const reduced = useReducedMotion();

  const ripple = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const field = fieldRef.current;
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    dotRefs.current.forEach((dot, index) => {
      if (!dot) return;
      const dotRect = dot.getBoundingClientRect();
      const dx = dotRect.left + dotRect.width / 2 - rect.left - x;
      const dy = dotRect.top + dotRect.height / 2 - rect.top - y;
      const distance = Math.hypot(dx, dy);
      if (distance < 74) {
        const force = (1 - distance / 74) * 9;
        dot.style.transform = `translate(${(dx / (distance || 1)) * force}px, ${
          (dy / (distance || 1)) * force
        }px) scale(${1 + (1 - distance / 74) * 0.35})`;
      } else if (index % 3 === 0) {
        dot.style.transform = "";
      }
    });
  };

  const resetRipple = () => {
    dotRefs.current.forEach((dot) => {
      if (dot) dot.style.transform = "";
    });
  };

  return (
    <div className="numeral" id="numeral-diagram">
      <div className="numeral__stats">
        {[
          ["15", "classes"],
          ["10,500", "images"],
          ["70", "writers"],
        ].map(([value, label]) => (
          <div key={label} className="numeral__stat">
            <span className="numeral__stat-value display">{value}</span>
            <span className="mono">{label}</span>
          </div>
        ))}
      </div>

      <div
        className={cx("numeral__field-wrap", `is-${split}`)}
        onPointerMove={ripple}
        onPointerLeave={resetRipple}
      >
        <div ref={fieldRef} className="numeral__field" aria-hidden="true">
          {writers.map((writer, index) => {
            const half = split === "random";
            const filled = !half && writer < 35;
            return (
              <span
                key={writer}
                ref={(node) => {
                  dotRefs.current[index] = node;
                }}
                className={cx(
                  "numeral__writer",
                  half && "is-half",
                  !half && filled && "is-filled",
                  !half && !filled && "is-hollow",
                )}
              />
            );
          })}
        </div>
        <span className="numeral__flash mono" aria-hidden="true">
          drag to ripple
        </span>
      </div>

      <div className="numeral__split">
        <div className="numeral__split-toggle" role="group" aria-label="Train and test split">
          <button
            type="button"
            className={cx("mono", split === "random" && "is-active")}
            onClick={() => setSplit("random")}
            aria-pressed={split === "random"}
          >
            RANDOM SPLIT
          </button>
          <button
            type="button"
            className={cx("mono", split === "grouped" && "is-active")}
            onClick={() => setSplit("grouped")}
            aria-pressed={split === "grouped"}
          >
            WRITER-GROUPED SPLIT
          </button>
        </div>
        <p className="numeral__split-note mono">
          {split === "random"
            ? "Writers leak across train and test · flagged in lime"
            : "Each writer sits entirely on one side · no mixed dots"}
        </p>
      </div>

      <div className="numeral__recipe">
        <div className="numeral__pills">
          {recipes.map((item) => (
            <motion.button
              key={item}
              type="button"
              className={cx("numeral__pill", recipe === item && "is-active")}
              drag={!reduced}
              dragSnapToOrigin
              dragElastic={0.5}
              dragMomentum={false}
              whileDrag={{ scale: 1.06, zIndex: 5 }}
              onDragEnd={(_, info) => {
                const target = document.elementFromPoint(info.point.x, info.point.y);
                if (target?.closest("[data-resnet]")) setRecipe(item);
              }}
              onClick={() => setRecipe(item)}
              aria-pressed={recipe === item}
            >
              <span className="mono">{item}</span>
            </motion.button>
          ))}
        </div>
        <div className="numeral__resnet" data-resnet>
          <span className="numeral__resnet-label display">ResNet-18</span>
          <p className="numeral__resnet-note mono" aria-live="polite">
            {recipe
              ? `${recipe} · part of the custom ResNet-18 training recipe`
              : "Custom ResNet-18 model"}
          </p>
        </div>
      </div>

      <div className="numeral__gradcam">
        <div className="numeral__gradcam-head mono">
          <span>Grad-CAM peek</span>
        </div>
        <div className="numeral__glyphs">
          {glyphs.map((glyph) => (
            <button
              key={glyph}
              type="button"
              className="numeral__glyph"
              aria-label={`Sample numeral ${glyph} with illustrative Grad-CAM heat overlay`}
            >
              <span aria-hidden="true">{glyph}</span>
              <span className="numeral__heat" aria-hidden="true" />
              <span className="numeral__heat-label mono">ILLUSTRATIVE</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
