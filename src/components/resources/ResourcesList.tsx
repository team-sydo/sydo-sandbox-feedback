
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  created_at: string;
}

interface ResourcesListProps {
  resources: Resource[];
}

export function ResourcesList({ resources }: ResourcesListProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune ressource pour le moment
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <Card key={resource.id}>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {resource.title}
              </CardTitle>
              <Badge>{resource.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Link className="h-4 w-4 mr-1" />
              Ouvrir le lien
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
