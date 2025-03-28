
import { File, FileVideo } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  title: string;
  client: string;
  sites: number;
  videos: number;
  status: "actif" | "archivé";
}

export function ProjectCard({ title, client, sites, videos, status }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Badge variant={status === "actif" ? "default" : "secondary"} className={status === "actif" ? "bg-green-500 hover:bg-green-600" : ""}>
            {status === "actif" ? "Actif" : "Archivé"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{client}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <File className="h-4 w-4" />
            <span>{sites} site{sites > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileVideo className="h-4 w-4" />
            <span>{videos} vidéo{videos > 1 ? "s" : ""}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
