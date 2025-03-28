
import { Check, ExternalLink, FileText, Video } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Grain {
  id: string;
  title: string;
  type: 'web' | 'video';
  url: string;
  done: boolean;
  project_id: string;
}

interface GrainsListProps {
  grains: Grain[];
  onStatusToggle: (grainId: string, done: boolean) => void;
  isUserLoggedIn: boolean;
}

export function GrainsList({ grains, onStatusToggle, isUserLoggedIn }: GrainsListProps) {
  if (grains.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun élément à tester pour ce projet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Lien</TableHead>
            <TableHead>Statut</TableHead>
            {isUserLoggedIn && <TableHead className="w-24">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {grains.map((grain) => (
            <TableRow key={grain.id}>
              <TableCell>
                {grain.type === 'web' ? (
                  <FileText className="h-5 w-5 text-blue-500" />
                ) : (
                  <Video className="h-5 w-5 text-red-500" />
                )}
              </TableCell>
              <TableCell className="font-medium">{grain.title}</TableCell>
              <TableCell>
                {grain.type === 'web' ? 'Site web' : 'Vidéo'}
              </TableCell>
              <TableCell>
                <a 
                  href={grain.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  Ouvrir <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </TableCell>
              <TableCell>
                <Badge variant={grain.done ? "success" : "outline"}>
                  {grain.done ? "Terminé" : "À tester"}
                </Badge>
              </TableCell>
              {isUserLoggedIn && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusToggle(grain.id, !grain.done)}
                    className={cn(
                      "text-gray-700 hover:text-gray-900",
                      grain.done && "text-green-600 hover:text-green-700"
                    )}
                  >
                    <Check className={cn(
                      "h-5 w-5 mr-1",
                      grain.done ? "opacity-100" : "opacity-30"
                    )} />
                    {grain.done ? "Terminé" : "Marquer"}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
