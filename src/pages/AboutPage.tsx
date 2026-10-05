import { ABOUT } from "../content/about";

export default function AboutPage() {
  return (
    <section className="page about-page">
      <h1 className="about-page-title">Despre ColabMe</h1>

      <section className="about-block" aria-labelledby="about-vision">
        <h2 id="about-vision">{ABOUT.vision.title}</h2>
        <p className="about-lead">{ABOUT.vision.lead}</p>
        {ABOUT.vision.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="about-block" aria-labelledby="about-mission">
        <h2 id="about-mission">{ABOUT.mission.title}</h2>
        <p className="about-lead">{ABOUT.mission.lead}</p>
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
