
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClientCombobox } from "@/components/ClientCombobox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface NewProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export function NewProjectDialog({ isOpen, onOpenChange, onProjectCreated }: NewProjectDialogProps) {
  const [newProject, setNewProject] = useState({ 
    title: "", 
    description: "",
    client_id: null as string | null,
    client_name: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const createClient = async (clientName: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          nom: clientName,
          user_id: user?.id
        })
        .select();

      if (error) throw error;
      
      return data[0].id;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le client: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const createProject = async () => {
    if (!newProject.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre du projet est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      let clientId = newProject.client_id;

      if (!clientId && newProject.client_name) {
        clientId = await createClient(newProject.client_name);
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: newProject.title,
          description: newProject.description || null,
          user_id: user?.id,
          client_id: clientId,
          created_by: user?.id
        })
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Projet créé avec succès",
      });

      // Reset form
      setNewProject({ title: "", description: "", client_id: null, client_name: "" });
      
      // Notify parent component
      onProjectCreated();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le projet",
        variant: "destructive",
      });
    }
  };

  const handleClientSelect = (clientId: string | null, clientName: string) => {
    setNewProject(prev => ({
      ...prev,
      client_id: clientId,
      client_name: clientName
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer un nouveau projet.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <ClientCombobox onClientSelect={handleClientSelect} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-title">Titre du projet</Label>
            <Input
              id="project-title"
              value={newProject.title}
              onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Mon nouveau projet"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (facultatif)</Label>
            <Textarea
              id="project-description"
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du projet"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={createProject} className="bg-blue-500 hover:bg-blue-600">
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
