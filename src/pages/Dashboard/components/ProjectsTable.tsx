
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Project } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Star, Trash2 } from "lucide-react";

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onDeleteProject?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  favoriteProjectIds?: string[];
}

export function ProjectsTable({ 
  projects = [], 
  loading, 
  onDeleteProject,
  onToggleFavorite,
  favoriteProjectIds = []
}: ProjectsTableProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chargement des projets...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun projet ne correspond à vos critères.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projet</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sites</TableHead>
            <TableHead>Vidéos</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <Link to={`/project/${project.id}`} className="hover:underline">
                  {project.title}
                </Link>
              </TableCell>
              <TableCell>{project.client_name || "-"}</TableCell>
              <TableCell className="max-w-xs truncate">{project.description || "-"}</TableCell>
              <TableCell>
                <Badge variant={project.active ? "success" : "destructive"}>
                  {project.active ? "Actif" : "Archivé"}
                </Badge>
              </TableCell>
              <TableCell>{project.sites || 0}</TableCell>
              <TableCell>{project.videos || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => onToggleFavorite(project.id)}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          favoriteProjectIds.includes(project.id)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Link
                      to={`/project/${project.id}/comments`}
                      className="flex items-center"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </Button>
                  {(project.sites || 0) + (project.videos || 0) === 0 && onDeleteProject && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
