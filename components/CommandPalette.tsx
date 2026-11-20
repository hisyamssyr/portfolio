"use client";

import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { navSections, type SectionId } from "@/content";
import { useBodyLock, useFocusTrap, useReducedMotion } from "@/lib/hooks";
import { useInteraction, useTheme } from "./providers";

type Command =
  | { kind: "section"; id: SectionId; label: string; hint: string }
  | { kind: "polarity"; label: string; hint: string };

function fuzzyScore(query: string, label: string): number {
  const needle = query.toLowerCase().trim();
  if (!needle) return 1;
  const haystack = label.toLowerCase();
  if (haystack.startsWith(needle)) return 100 - haystack.length;
  if (haystack.includes(needle)) return 60 - haystack.indexOf(needle);
  let index = 0;
  let score = 0;
  for (const char of needle) {
    const found = haystack.indexOf(char, index);
    if (found === -1) return -1;
    score += 1;
    index = found + 1;
  }
  return score;
}

export default function CommandPalette() {
  const { paletteOpen, closePalette, navigateTo } = useInteraction();
  const { theme, toggleTheme } = useTheme();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useBodyLock(paletteOpen);
  useFocusTrap(panelRef, paletteOpen, closePalette);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (paletteOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setSelected(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [paletteOpen]);

  const commands = useMemo<Command[]>(() => {
    const sections: Command[] = navSections.map((section) => ({
      kind: "section",
      id: section.id,
      label: section.label,
      hint: `Go to ${section.label.toLowerCase()}`,
    }));
    const polarity: Command = {
      kind: "polarity",
      label: "Polarity",
      hint: theme === "dark" ? "Switch to Frost" : "Switch to Dark",
    };
    return [...sections, polarity];
  }, [theme]);

  const filtered = useMemo(() => {
    const ranked = commands
      .map((command) => ({ command, score: fuzzyScore(query, command.label) }))
      .filter((entry) => entry.score >= 0);
    if (!query.trim()) return commands;
    return ranked.sort((a, b) => b.score - a.score).map((entry) => entry.command);
  }, [commands, query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected((current) => Math.min(current, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const run = (command: Command) => {
    if (command.kind === "section") {
      closePalette();
      window.setTimeout(() => {
        navigateTo(command.id, {
          x: window.innerWidth / 2,
          y: window.innerHeight * 0.45,
        });
      }, 80);
      return;
    }
    toggleTheme({ x: window.innerWidth - 90, y: window.innerHeight - 90 });
    closePalette();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="palette"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.22 }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closePalette();
          }}
        >
          <motion.div
            ref={panelRef}
            className="palette__panel glass"
            initial={reduced ? false : { opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 360, damping: 30, mass: 0.8 }
            }
          >
            <div className="palette__search">
              <Search size={18} strokeWidth={1.6} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a section, or polarity"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={
                  filtered[selected] ? `command-${selected}` : undefined
                }
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setSelected((current) => (current + 1) % Math.max(1, filtered.length));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setSelected(
                      (current) =>
                        (current - 1 + Math.max(1, filtered.length)) %
                        Math.max(1, filtered.length),
                    );
                  }
                  if (event.key === "Enter" && filtered[selected]) {
                    event.preventDefault();
                    run(filtered[selected]);
                  }
                }}
              />
              <kbd className="palette__key">ESC</kbd>
              <button
                type="button"
                className="palette__close"
                aria-label="Close command palette"
                onClick={closePalette}
              >
                <X size={17} strokeWidth={1.7} aria-hidden="true" />
              </button>
            </div>
            <ul className="palette__list" id="command-list" role="listbox">
              {filtered.length === 0 && (
                <li className="palette__empty mono">No command matches “{query}”.</li>
              )}
              {filtered.map((command, index) => (
                <li
                  key={`${command.kind}-${command.label}`}
                  id={`command-${index}`}
                  role="option"
                  aria-selected={index === selected}
                >
                  <button
                    type="button"
                    className={`palette__item${index === selected ? " is-selected" : ""}`}
                    onPointerEnter={() => setSelected(index)}
                    onClick={() => run(command)}
                  >
                    <span className="palette__item-label">{command.label}</span>
                    <span className="palette__item-hint mono">{command.hint}</span>
                    {index === selected && (
                      <CornerDownLeft
                        className="palette__enter"
                        size={14}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="palette__foot mono">
              <span>↑↓ NAVIGATE</span>
              <span>↵ SELECT</span>
              <span>/ TO OPEN</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
