import { Eye, CheckCircle, ExternalLink, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RetourToggle } from "@/components/grains/RetourToggle";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditGrainForm } from "@/components/EditGrainForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Grain } from "@/types";

interface GrainsListProps {
  grains: Grain[];
  onStatusToggle: (grainId: string, done: boolean) => void;
  isUserLoggedIn: boolean;
  onGrainUpdate?: (updatedGrain: Grain) => void;
  onGrainDelete?: (grainId: string) => void;
  onRetourToggle?: (grainId: string, enabled: boolean) => void;
  showRetourToggle?: boolean;
}

export function GrainsList({ 
  grains,
  onStatusToggle,
  isUserLoggedIn,
  onGrainUpdate,
  onGrainDelete,
  onRetourToggle,
  showRetourToggle = true,
}: GrainsListProps) {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGrain, setCurrentGrain] = useState<Grain | null>(null);
  const { toast } = useToast();

  // Group grains by retour_on status
  const activeRetours = grains.filter(grain => grain.retour_on);
  const inactiveRetours = grains.filter(grain => !grain.retour_on);

  if (grains.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Aucun élément à tester pour le moment</p>
      </div>
    );
  }

  const handleEdit = (grain: Grain) => {
    setCurrentGrain(grain);
    setIsEditFormOpen(true);
  };

  const handleDelete = (grain: Grain) => {
    setCurrentGrain(grain);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentGrain) return;

    try {
      const { error } = await supabase
        .from('grains')
        .delete()
        .eq('id', currentGrain.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'élément a été supprimé",
      });

      if (onGrainDelete) {
        onGrainDelete(currentGrain.id);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'élément",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentGrain(null);
    }
  };

  const handleGrainUpdate = (updatedGrain: Grain) => {
    setIsEditFormOpen(false);
    setCurrentGrain(null);
    
    if (onGrainUpdate) {
      onGrainUpdate(updatedGrain);
    }
  };

  const renderGrainsList = (grainsList: Grain[], title: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      {grainsList.map((grain) => (
        <ContextMenu key={grain.id}>
          <ContextMenuTrigger>
            <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{grain.title}</h3>
                    <a 
                      href={grain.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <Badge variant={grain.type === 'web' ? "default" : "secondary"}>
                      {grain.type === 'web' ? 'Site' : 'Vidéo'}
                    </Badge>
                    {grain.done && (
                      <Badge variant="success">Terminé</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {showRetourToggle && onRetourToggle && (
                    <div className="flex items-center gap-2 mr-2">
                      <span className="text-sm text-gray-500">Retours</span>
                      <RetourToggle
                        isEnabled={grain.retour_on}
                        onToggle={(enabled) => onRetourToggle(grain.id, enabled)}
                        disabled={!isUserLoggedIn}
                      />
                    </div>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/project/${grain.project_id}/comments?grain=${grain.id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Retours
                    </Link>
                  </Button>
                  <Link to={`/grain/${grain.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Tester
                    </Button>
                  </Link>
                  {isUserLoggedIn && (
                    <>
                      <Button 
                        size="sm" 
                        variant={grain.done ? "outline" : "default"}
                        onClick={() => onStatusToggle(grain.id, grain.done)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {grain.done ? "Rouvrir" : "Terminer"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(grain)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(grain)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </ContextMenuTrigger>
          {isUserLoggedIn && (
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleEdit(grain)}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleDelete(grain)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenu>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {renderGrainsList(activeRetours, "Éléments avec retours activés")}
      {renderGrainsList(inactiveRetours, "Éléments avec retours désactivés")}

      {/* Edit Grain Form */}
      {currentGrain && isEditFormOpen && (
        <EditGrainForm
          grain={currentGrain}
          onClose={() => {
            setIsEditFormOpen(false);
            setCurrentGrain(null);
          }}
          onSubmit={handleGrainUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer cet élément</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
