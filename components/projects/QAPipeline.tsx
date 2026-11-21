"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

const gates = [1, 2, 3, 4, 5, 6];

const gateReadouts = [
  "Regression failures validated",
  "Patched test success validated",
  "Browser replay validated",
  "Verification gate",
  "Verification gate",
  "Verification gate",
];

export default function QAPipeline() {
  const [passed, setPassed] = useState(0);
  const [running, setRunning] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    return () => {
      cancelled.current = true;
    };
  }, []);

  const run = async () => {
    if (running) return;
    cancelled.current = false;
    setRunning(true);
    setPassed(0);
    for (let gate = 0; gate < gates.length; gate += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 520));
      if (cancelled.current) return;
      setPassed(gate + 1);
    }
    if (!cancelled.current) setRunning(false);
  };

  const readout =
    passed === 0
      ? "Awaiting run"
      : `${String(passed).padStart(2, "0")} / 06 · ${gateReadouts[passed - 1]}`;

  return (
    <div className="qa" id="qa-diagram">
      <div className="qa__head mono">
        <span>Six-gate verifier</span>
        <span>SIMULATED RUN</span>
      </div>

      <div
        className={cx("qa__security", securityOpen && "is-open")}
        role="group"
        tabIndex={0}
        aria-label="Security controls"
        onPointerEnter={() => setSecurityOpen(true)}
        onPointerLeave={() => setSecurityOpen(false)}
        onFocus={() => setSecurityOpen(true)}
        onBlur={() => setSecurityOpen(false)}
      >
        <span className="qa__security-ring" aria-hidden="true" />
        <span className="qa__security-label mono">Security controls</span>
        <div className="qa__lane">
          <span className="qa__wire" aria-hidden="true" />
          <span
            className="qa__dot"
            aria-hidden="true"
            style={{ left: `${(passed / gates.length) * 100}%` }}
          />
          {gates.map((gate) => {
            const active = passed >= gate;
            return (
              <div
                key={gate}
                className={cx("qa__gate", active && "is-passed")}
                aria-label={`Gate ${String(gate).padStart(2, "0")} ${
                  active ? "passed" : "pending"
                }`}
              >
                <span className="qa__ring" aria-hidden="true">
                  <span className="qa__gate-num">{String(gate).padStart(2, "0")}</span>
                </span>
                <span className="qa__gate-label mono">GATE {String(gate).padStart(2, "0")}</span>
              </div>
            );
          })}
        </div>
        <ul className="qa__security-list">
          <li>SSRF prevention</li>
          <li>DNS rebinding mitigation</li>
          <li>Same-origin enforcement</li>
          <li>Credential redaction</li>
        </ul>
      </div>

      <div className="qa__controls">
        <button
          type="button"
          className="qa__run"
          onClick={run}
          disabled={running}
          aria-label="Run the six-gate verification illustration"
        >
          <Play size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          {running ? "RUNNING" : "RUN"}
        </button>
        <p className="qa__readout mono" aria-live="polite">
          {readout}
        </p>
      </div>

      <div className="qa__github">
        <svg className="qa__github-lines" viewBox="0 0 300 120" aria-hidden="true">
          <path d="M 58 62 C 110 62, 120 30, 152 30" />
          <path d="M 58 62 C 110 62, 120 92, 152 92" />
        </svg>
        <div className="qa__github-node glass">
          <span className="mono">GitHub Apps auth</span>
        </div>
        <div className="qa__github-node qa__github-node--b glass">
          <span className="mono">REST APIs</span>
        </div>
        <ul className="qa__github-notes">
          <li>Inspect repositories</li>
          <li>Commit bounded patches to restricted branches</li>
          <li>Create idempotent draft PRs</li>
        </ul>
      </div>

      <p className="qa__foot mono">
        Illustration: six gates · isolated Docker sandboxes · no live data
      </p>
    </div>
  );
}
