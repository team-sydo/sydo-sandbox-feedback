
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
import { FileText, Video, MessageSquare, Trash2, Star } from "lucide-react";
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
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
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
  isFavorite = false,
  onToggleFavorite,
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
      onDelete(id);
    }
    setIsOpen(false);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  return (
    <div className="group">
      <Link to={`/project/${id}`} className="block">
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
          <CardHeader className="bg-gray-50 pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={status === "actif" ? "success" : "destructive"}>
                  {status === "actif" ? "Actif" : "Archivé"}
                </Badge>
                {onToggleFavorite && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto" 
                    onClick={handleFavoriteClick}
                  >
                    <Star 
                      className={`h-5 w-5 ${isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} 
                    />
                  </Button>
                )}
              </div>
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
                <Button variant="outline" size="sm">
                  <Link to={`/project/${id}/comments`} className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Retours
                  </Link>
                </Button>
                {sites + videos === 0 && onDelete && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(e);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
