
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Video } from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  client: string;
  sites: number;
  videos: number;
  status: 'actif' | 'archivé';
}

export function ProjectCard({ id, title, client, sites, videos, status }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant={status === 'actif' ? 'success' : 'destructive'}>
            {status === 'actif' ? 'Actif' : 'Archivé'}
          </Badge>
        </div>
        <p className="text-gray-600 text-sm">{client}</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-500 mr-1" />
            <span className="text-sm">{sites} {sites > 1 ? 'sites' : 'site'}</span>
          </div>
          <div className="flex items-center">
            <Video className="h-5 w-5 text-red-500 mr-1" />
            <span className="text-sm">{videos} {videos > 1 ? 'vidéos' : 'vidéo'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
        >
          <Link to={`/project/${id}`}>
            Voir le projet
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
