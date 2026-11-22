"use client";

import { FileDown } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import { site } from "@/content";
import { cx } from "@/lib/cx";
import { useFinePointer, useOnceInView, useReducedMotion } from "@/lib/hooks";
import { Photo } from "../Photo";
import { SplitHeading } from "../SplitText";

export default function About() {
  const [ref, seen] = useOnceInView<HTMLElement>({ threshold: 0.22 });
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const words = site.summary.split(" ");

  return (
    <section id="about" ref={ref} className="section about" aria-labelledby="about-title">
      <div className="section-inner about__inner">
        <div className="about__stage">
          <span
            className="about__echo display outline-type"
            aria-hidden="true"
            data-parallax="6"
          >
            ABOUT
          </span>
          <SplitHeading
            text="ABOUT"
            as="h2"
            className="section-title about__title display"
            ariaLabel="About"
          />
          <div className="about__body">
            <div
              ref={sheetRef}
              className={cx("about__sheet glass glass--text", seen && "is-seen")}
              style={{ rotate: "-1.2deg" }}
            >
              <span className="about__sweep" aria-hidden="true" />
              <p className="about__copy body-copy">
                {words.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className="reveal-word"
                    style={{ transitionDelay: `${Math.min(index * 16, 720)}ms` }}
                  >
                    {word}
                    {index < words.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
              <div className="about__keywords">
                {site.keywords.map((keyword) => (
                  <span key={keyword} className="about__keyword serif" data-keyword={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
              <div className="about__meta mono">
                <span>{site.institution}</span>
                <span>{site.location}</span>
              </div>
            </div>

            <div className="about__photo-cluster">
              <motion.div
                className="about__photo-frame glass"
                drag={fine && !reduced}
                dragMomentum
                dragElastic={0.22}
                dragConstraints={{ left: -48, right: 48, top: -40, bottom: 40 }}
                whileDrag={{ scale: 1.03, rotate: 1 }}
                style={{ rotate: "3.4deg", touchAction: fine ? "none" : undefined }}
              >
                <Photo
                  slot="profile/about-candid"
                  sizes="(max-width: 640px) 52vw, 300px"
                  className="about__photo"
                />
                <span className="about__photo-tag mono">PROFILE / 1:1</span>
              </motion.div>
              {site.cvUrl && (
                <a
                  className="about__cv"
                  href={site.cvUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="View CV (PDF)"
                >
                  <FileDown size={15} strokeWidth={1.7} aria-hidden="true" />
                  <span>View CV</span>
                  <span className="about__cv-format mono">PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
