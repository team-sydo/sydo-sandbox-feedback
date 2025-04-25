
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trash, Eye, Star as StarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Project } from "@/pages/Dashboard";

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onDeleteProject: (projectId: string) => void;
  onToggleFavorite: (projectId: string) => void;
  favoriteProjectIds: string[];
}

export function ProjectsTable({ projects, loading, onDeleteProject, onToggleFavorite, favoriteProjectIds }: ProjectsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Contenus</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Nom</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Contenus</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="font-medium">{project.title}</div>
                  {project.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {project.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>{project.client_name || "-"}</TableCell>
                <TableCell>
                  <Badge variant={project.active ? "success" : "destructive"}>
                    {project.active ? "Actif" : "Archivé"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {project.sites && project.sites > 0 && (
                      <Badge variant="outline">{project.sites} sites</Badge>
                    )}
                    {project.videos && project.videos > 0 && (
                      <Badge variant="outline">{project.videos} vidéos</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${favoriteProjectIds.includes(project.id) ? 'text-yellow-500' : 'text-gray-400'}`}
                      onClick={() => onToggleFavorite(project.id)}
                    >
                      <StarIcon className={`h-5 w-5 ${favoriteProjectIds.includes(project.id) ? 'fill-yellow-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link to={`/project/${project.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500" 
                      onClick={() => onDeleteProject(project.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
