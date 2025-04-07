import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Grain } from "@/types";

interface EditGrainFormProps {
  grain: Grain;
  onClose: () => void;
  onSubmit: (grain: Grain) => void;
}

export function EditGrainForm({ grain, onClose, onSubmit }: EditGrainFormProps) {
  const [title, setTitle] = useState(grain.title);
  const [type, setType] = useState<Grain['type']>(grain.type);
  const [url, setUrl] = useState(grain.url);
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
        .update({
          title,
          type,
          url
        })
        .eq('id', grain.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        toast({
          title: "Succès",
          description: "L'élément a été mis à jour",
        });
        onSubmit(data);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'élément",
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
          <DialogTitle>Modifier un élément à tester</DialogTitle>
          <DialogDescription>
            Modifier cet élément web ou vidéo pour ce projet.
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
              onValueChange={(value) => setType(value as Grain['type'])}
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
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
