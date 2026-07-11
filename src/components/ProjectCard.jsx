export default function ProjectCard({ project }) {
  return (
    <div className="lg-glass lg-project-card">
      <div className="lg-project-thumb" style={{ background: project.gradient }} />
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="lg-tag-row">
        {project.tags.map((tag) => (
          <span key={tag} className="lg-tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
