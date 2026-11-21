import { experience } from "@/content";
import Gallery from "../Gallery";
import { SplitHeading } from "../SplitText";

export default function Experience() {
  return (
    <section
      id="experience"
      className="section experience"
      aria-labelledby="experience-title"
    >
      <div className="section-inner">
        <div className="experience__head">
          <SplitHeading
            text="EXPERIENCE"
            as="h2"
            className="section-title experience__title display"
            ariaLabel="Experience"
          />
          <span
            className="experience__echo display outline-type"
            aria-hidden="true"
            data-parallax="5"
          >
            TIME
          </span>
        </div>

        <div className="experience__list">
          {experience.map((role) => (
            <article key={role.id} className="experience__panel glass glass--text">
              <div className="experience__panel-inner">
                <div className="experience__panel-head">
                  <div>
                    <span className="mono">
                      {role.dates} · {role.org}
                    </span>
                    <h3 className="experience__panel-title">{role.role}</h3>
                  </div>
                </div>
                <div className="experience__panel-body">
                  <ul className="experience__panel-bullets">
                    {role.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <Gallery
                    slots={[role.cover, ...role.details]}
                    label={`${role.role} photos`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
