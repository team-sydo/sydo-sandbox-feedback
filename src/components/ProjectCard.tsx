import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Video, MessageSquare, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  client: string;
  sites: number;
  videos: number;
  status: "actif" | "archivé";
  onDelete?: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  client,
  description,
  sites,
  videos,
  status,
  onDelete,
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    // e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(id);
    }
    setIsOpen(false);
  };

  // Pour éviter la propagation du clic sur le bouton de suppression au lien parent
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link to={`/project/${id}`}>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{title}</CardTitle>
            <Badge variant={status === "actif" ? "success" : "destructive"}>
              {status === "actif" ? "Actif" : "Archivé"}
            </Badge>
          </div>
          <p className="text-gray-600 text-sm h-10 overflow-hidden">{client}</p>
          <p className="text-gray-600 text-sm h-10 overflow-hidden">
            {description}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-1" />
              <span className="text-sm">
                {sites + videos} {sites + videos > 1 ? "grains" : "grain"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/project/${id}/comments`}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Retours
                </Link>
              </Button>
              {sites + videos === 0 ? 
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
              </Button> : null}
            </div>
          </div>
        </CardContent>
        {/* <CardFooter className="bg-gray-50 justify-end gap-2">
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild onClick={handleDeleteClick}>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. Cela supprimera définitivement le projet
                  "{title}" et tous les grains associés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter> */}
      </Card>
    </Link>
  );
}
