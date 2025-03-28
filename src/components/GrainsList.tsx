
import { Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Grain {
  id: string;
  title: string;
  type: 'web' | 'video';
  url: string;
  done: boolean;
}

interface GrainsListProps {
  grains: Grain[];
  onStatusToggle: (grainId: string, done: boolean) => void;
  isUserLoggedIn: boolean;
}

export function GrainsList({ grains, onStatusToggle, isUserLoggedIn }: GrainsListProps) {
  if (grains.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Aucun élément à tester pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grains.map((grain) => (
        <div 
          key={grain.id} 
          className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{grain.title}</h3>
                <Badge variant={grain.type === 'web' ? "default" : "secondary"}>
                  {grain.type === 'web' ? 'Site' : 'Vidéo'}
                </Badge>
                {grain.done && (
                  <Badge variant="success">Terminé</Badge>
                )}
              </div>
              <a 
                href={grain.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-500 hover:underline"
              >
                {grain.url}
              </a>
            </div>
            <div className="flex gap-2">
              <Link to={`/grain/${grain.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Tester
                </Button>
              </Link>
              {isUserLoggedIn && (
                <Button 
                  size="sm" 
                  variant={grain.done ? "outline" : "default"}
                  onClick={() => onStatusToggle(grain.id, grain.done)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {grain.done ? "Rouvrir" : "Terminer"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
