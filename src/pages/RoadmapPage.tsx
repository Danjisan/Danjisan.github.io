import RoadmapPath from "../components/RoadmapPath";
import { MILESTONES } from "../data/roadmap";

export default function RoadmapPage() {
  return (
    <section className="page">
      <h1>Roadmap</h1>
      <p>
        Drumul ColabMe, pas cu pas. Apasă pe un milestone pentru detalii.
      </p>
      <RoadmapPath milestones={MILESTONES} />
    </section>
  );
}
