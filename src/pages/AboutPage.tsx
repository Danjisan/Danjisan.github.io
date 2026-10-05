import { ABOUT } from "../content/about";

export default function AboutPage() {
  return (
    <section className="page about-page">
      <h1>Despre ColabMe</h1>

      <section className="about-block" aria-labelledby="about-vision">
        <h2 id="about-vision">{ABOUT.vision.title}</h2>
        <p className="about-lead">{ABOUT.vision.lead}</p>

        <div className="about-pillars">
          {ABOUT.vision.pillars.map((pillar) => (
            <div key={pillar.title} className="about-pillar">
              <h3 className="about-pillar-title">{pillar.title}</h3>
              {pillar.items.length > 0 ? (
                <ul className="about-pillar-list">
                  {pillar.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="about-pillar-todo">De completat</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="about-block" aria-labelledby="about-mission">
        <h2 id="about-mission">{ABOUT.mission.title}</h2>
        <p className="about-lead">{ABOUT.mission.lead}</p>
        {ABOUT.mission.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="about-block" aria-labelledby="about-objectives">
        <h2 id="about-objectives">{ABOUT.objectives.title}</h2>
        <ul className="about-objectives">
          {ABOUT.objectives.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
