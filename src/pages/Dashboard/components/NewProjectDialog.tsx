
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientCombobox } from "@/components/ClientCombobox";

interface NewProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export function NewProjectDialog({ isOpen, onOpenChange, onProjectCreated }: NewProjectDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClient, setSelectedClient] = useState<{ value: string; label: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un projet",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre du projet est requis",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Créer le projet
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            title,
            description: description.trim() || null,
            client_id: selectedClient?.value || null,
            user_id: user.id,
            created_by: user.id,
            active: true,
          },
        ])
        .select('id')
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le projet a été créé avec succès",
      });
      
      // Réinitialiser le formulaire et fermer la modale
      setTitle("");
      setDescription("");
      setSelectedClient(null);
      onProjectCreated();
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le projet",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du projet *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du projet"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du projet"
              rows={3}
            />
          </div>
          
          
          <div className="space-y-2">
            <Label>Client</Label>
            <ClientCombobox 
              value={selectedClient} 
              onChange={setSelectedClient}
              placeholder="Sélectionner un client"
              emptyMessage="Aucun client trouvé"
              items={[]} 
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer le projet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
