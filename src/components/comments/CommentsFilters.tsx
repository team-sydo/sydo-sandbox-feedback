
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Grain, type Author } from "@/hooks/useProjectComments";

interface CommentsFiltersProps {
  grains: Grain[];
  authors: Author[];
  selectedGrainId: string | null;
  setSelectedGrainId: (id: string | null) => void;
  statusFilter: "all" | "done" | "pending";
  setStatusFilter: (status: "all" | "done" | "pending") => void;
  selectedAuthorId: string | null;
  setSelectedAuthorId: (id: string | null) => void;
  onRefresh: () => void;
}

export function CommentsFilters({
  grains,
  authors,
  selectedGrainId,
  setSelectedGrainId,
  statusFilter,
  setStatusFilter,
  selectedAuthorId,
  setSelectedAuthorId,
  onRefresh
}: CommentsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="w-full sm:w-64">
          <Select
            value={selectedGrainId || "all"}
            onValueChange={(value) =>
              setSelectedGrainId(value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par grain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les grains</SelectItem>
              {grains.map((grain) => (
                <SelectItem key={grain.id} value={grain.id}>
                  {grain.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "done" | "pending")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="done">Traités</SelectItem>
              <SelectItem value="pending">Non traités</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-64">
          <Select
            value={selectedAuthorId || "all"}
            onValueChange={(value) =>
              setSelectedAuthorId(value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par auteur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les auteurs</SelectItem>
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name} ({author.type === "user" ? "Utilisateur" : "Invité"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button variant="outline" onClick={onRefresh}>
        <Filter className="h-4 w-4 mr-2" />
        Actualiser
      </Button>
    </div>
  );
}
