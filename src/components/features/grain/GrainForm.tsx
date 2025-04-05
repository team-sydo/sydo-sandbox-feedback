
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Grain {
  id: string;
  title: string;
  type: 'web' | 'video';
  url: string;
  done: boolean;
  project_id: string;
}

interface GrainFormProps {
  projectId: string;
  onClose: () => void;
  onSubmit: (grain: Grain) => void;
}

export function GrainForm({ projectId, onClose, onSubmit }: GrainFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'web' | 'video'>('web');
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive",
      });
      return;
    }

    if (!url.trim()) {
      toast({
        title: "Erreur",
        description: "L'URL est requise",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('grains')
        .insert({
          title,
          type,
          url,
          project_id: projectId,
          done: false
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onSubmit(data);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le grain",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un élément à tester</DialogTitle>
          <DialogDescription>
            Ajouter un nouvel élément web ou vidéo à tester pour ce projet.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page d'accueil"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Type d'élément</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as 'web' | 'video')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="web" id="web" />
                <Label htmlFor="web">Site web</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video">Vidéo</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
              required
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
