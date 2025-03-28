
import { ProjectCard } from "@/components/ProjectCard";
import { Project } from "../types";

interface ProjectsListProps {
  projects: Project[];
  loading: boolean;
}

export function ProjectsList({ projects, loading }: ProjectsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chargement des projets...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500">Aucun projet ne correspond à vos critères.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          title={project.title}
          client={project.client_name || project.description || ""}
          sites={project.sites || 0}
          videos={project.videos || 0}
          status={project.active ? "actif" : "archivé"}
        />
      ))}
    </div>
  );
}
