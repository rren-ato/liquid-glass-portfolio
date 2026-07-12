import { PROJECTS } from "../data/projects";
import ProjectCard from "./ProjectCard";
import RevealRTL from "./RevealRTL";

export default function Projects() {
  return (
    <section className="lg-section" id="projects">
      <RevealRTL>
        <div className="lg-section-head">// proyectos</div>
        <h2 className="lg-section-title">Cosas que fui construyendo</h2>
      </RevealRTL>
      <div className="lg-grid">
        {PROJECTS.map((project, i) => (
          <RevealRTL key={project.title} delay={i * 140}>
            <ProjectCard project={project} />
          </RevealRTL>
        ))}
      </div>
    </section>
  );
}
