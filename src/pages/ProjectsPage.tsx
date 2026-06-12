import MediaBox from "../components/media/MediaBox";
import { PROJECTS } from "../data/projects";

export default function ProjectsPage() {
  return (
    <section className="page">
      <h1>Proiecte</h1>
      <div className="project-list">
        {PROJECTS.map((project) => (
          <article key={project.id} className="project-card">
            <h2>{project.name}</h2>
            <p className="project-tagline">{project.tagline}</p>
            <p>{project.description}</p>
            {project.media.map((m, i) => (
              <MediaBox key={i} media={m.content} aspect={m.aspect} />
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
