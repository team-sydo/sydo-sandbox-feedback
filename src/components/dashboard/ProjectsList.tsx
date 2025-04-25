
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trash, Star as StarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Project } from "@/pages/Dashboard";

interface ProjectsListProps {
  projects: Project[];
  loading: boolean;
  onDeleteProject: (projectId: string) => void;
  onToggleFavorite: (projectId: string) => void;
  favoriteProjectIds: string[];
}

export function ProjectsList({ projects, loading, onDeleteProject, onToggleFavorite, favoriteProjectIds }: ProjectsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Aucun projet trouvé</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par créer un nouveau projet en utilisant le bouton ci-dessus.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Link to={`/project/${project.id}`} className="hover:underline">
                <CardTitle className="text-xl">{project.title}</CardTitle>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${favoriteProjectIds.includes(project.id) ? 'text-yellow-500' : 'text-gray-400'}`}
                onClick={() => onToggleFavorite(project.id)}
              >
                <StarIcon className={`h-5 w-5 ${favoriteProjectIds.includes(project.id) ? 'fill-yellow-500' : ''}`} />
              </Button>
            </div>
            {project.client_name && (
              <div className="text-sm text-gray-500">{project.client_name}</div>
            )}
          </CardHeader>
          <CardContent>
            {project.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                {project.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={project.active ? "success" : "destructive"}>
                {project.active ? "Actif" : "Archivé"}
              </Badge>
              {project.sites && project.sites > 0 && (
                <Badge variant="outline">{project.sites} sites</Badge>
              )}
              {project.videos && project.videos > 0 && (
                <Badge variant="outline">{project.videos} vidéos</Badge>
              )}
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/project/${project.id}`}>Voir le projet</Link>
              </Button>
              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDeleteProject(project.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
