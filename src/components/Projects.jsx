import { PROJECTS } from "../data/projects";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <section className="lg-section" id="projects">
      <div className="lg-section-head">// proyectos</div>
      <h2 className="lg-section-title">Cosas que fui construyendo</h2>
      <div className="lg-grid">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
