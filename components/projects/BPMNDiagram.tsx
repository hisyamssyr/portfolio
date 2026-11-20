"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { cx } from "@/lib/cx";
import { useReducedMotion } from "@/lib/hooks";

type Node = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
};

const modes = ["SINGLE AGENT", "SINGLE + RAG", "MULTI-AGENT + RAG"] as const;

const roles: Node[] = [
  { id: "analyst", label: "analyst", sub: "role", x: 13, y: 20 },
  { id: "backend", label: "backend", sub: "role", x: 13, y: 50 },
  { id: "frontend", label: "frontend", sub: "role", x: 13, y: 80 },
  { id: "css", label: "CSS", sub: "role", x: 36, y: 35 },
  { id: "reviewer", label: "reviewer", sub: "role", x: 36, y: 65 },
];

const storage: Node = {
  id: "store",
  label: "retrieval store",
  sub: "ERP codebase",
  x: 72,
  y: 50,
};

const singleAgent: Node = { id: "agent", label: "single agent", x: 38, y: 50 };

export default function BPMNDiagram() {
  const [mode, setMode] = useState(0);
  const reduced = useReducedMotion();

  const allNodes: Node[] = [singleAgent, storage, ...roles];
  const visible = (id: string) => {
    if (id === "agent") return true;
    if (id === "store") return mode > 0;
    return mode === 2;
  };
  const positionFor = (node: Node): Node => {
    if (node.id === "agent") return { ...node, x: mode === 0 ? 38 : 30 };
    return node;
  };

  const edges =
    mode === 0
      ? []
      : mode === 1
        ? [{ from: "agent", to: "store" }]
        : roles.map((role) => ({ from: role.id, to: "store" }));

  const find = (id: string) => allNodes.map(positionFor).find((node) => node.id === id);

  return (
    <div className="bpmn" id="bpmn-diagram">
      <div className="bpmn__toggle" role="group" aria-label="Diagram setup">
        {modes.map((label, index) => (
          <button
            key={label}
            type="button"
            className={cx("bpmn__toggle-btn mono", mode === index && "is-active")}
            onClick={() => setMode(index)}
            aria-pressed={mode === index}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bpmn__stage">
        <span className="bpmn__halftone halftone" aria-hidden="true" />
        <svg className="bpmn__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map((edge) => {
            const from = find(edge.from);
            const to = find(edge.to);
            if (!from || !to) return null;
            const midX = (from.x + to.x) / 2;
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                vectorEffect="non-scaling-stroke"
                className="bpmn__edge"
              />
            );
          })}
        </svg>
        {allNodes.map((node) => {
          const target = positionFor(node);
          const shown = visible(node.id);
          return (
            <motion.div
              key={node.id}
              className={cx(
                "bpmn__node glass",
                node.id === "store" && "bpmn__node--store",
                node.sub === "role" && "bpmn__node--role",
              )}
              initial={false}
              animate={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                opacity: shown ? 1 : 0,
                scale: shown ? 1 : 0.8,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 150, damping: 20, mass: 0.7 }
              }
              style={{
                transform: "translate(-50%, -50%)",
                pointerEvents: shown ? "auto" : "none",
              }}
              aria-hidden={!shown}
            >
              <span className="bpmn__node-label mono">{node.label}</span>
              {node.sub && <span className="bpmn__node-sub mono">{node.sub}</span>}
              {node.id === "store" && <span className="bpmn__node-pulse" aria-hidden="true" />}
            </motion.div>
          );
        })}
        <p className="bpmn__stage-label mono" aria-hidden="true">
          BPMN UPDATE → PLANNING
        </p>
      </div>

      <p className="bpmn__note mono">
        Comparative experiments: single-agent, single-agent with RAG, multi-agent with RAG
      </p>
    </div>
  );
}
