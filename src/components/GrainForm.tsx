
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Grain } from "@/types";
import { Upload, FileUp } from "lucide-react";

interface GrainFormProps {
  projectId: string;
  onClose: () => void;
  onSubmit: (grain: Grain) => void;
}

export function GrainForm({ projectId, onClose, onSubmit }: GrainFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Grain['type']>('web');
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (type !== 'pdf' && !url.trim()) {
      toast({
        title: "Erreur",
        description: "L'URL est requise",
        variant: "destructive",
      });
      return;
    }

    if (type === 'pdf' && !url.trim() && !pdfFile) {
      toast({
        title: "Erreur",
        description: "Vous devez fournir une URL ou télécharger un fichier PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      let fileUrl = url;
      
      // If a PDF file was uploaded, store it in Supabase Storage
      if (type === 'pdf' && pdfFile) {
        const fileName = `${Date.now()}-${pdfFile.name.replace(/\s/g, '_')}`;
        const filePath = `public/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase
          .storage
          .from('pdf-files')
          .upload(filePath, pdfFile, {
            contentType: 'application/pdf',
            cacheControl: '3600',
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase
          .storage
          .from('pdf-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('grains')
        .insert({
          title,
          type,
          url: fileUrl,
          project_id: projectId,
          done: false
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onSubmit(data as Grain);
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

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner un fichier PDF",
          variant: "destructive",
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'pdf') {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    if (type === 'pdf' && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        toast({
          title: "Format invalide",
          description: "Veuillez déposer uniquement des fichiers PDF",
          variant: "destructive",
        });
        return;
      }
      setPdfFile(file);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un élément à tester</DialogTitle>
          <DialogDescription>
            Ajouter un nouvel élément web, vidéo ou PDF à tester pour ce projet.
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
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="web" id="web" />
                <Label htmlFor="web">Site web</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video">Vidéo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="figma" id="figma" />
                <Label htmlFor="figma">Figma</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="GSlide" id="gslide" />
                <Label htmlFor="gslide">Google Slide</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div 
            className={`space-y-2 ${type === 'pdf' ? 'mb-4' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={type === 'pdf' ? "URL du PDF (optionnel si vous téléchargez un fichier)" : "https://example.com"}
              type="url"
              required={type !== 'pdf'}
              className={isDraggingOver ? "border-blue-400 bg-blue-50" : ""}
            />
          </div>
          
          {type === 'pdf' && (
            <div 
              className={`space-y-2 ${isDraggingOver ? 'bg-blue-50 border border-blue-300 rounded-md p-4' : ''}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePdfFileChange} 
                className="hidden" 
                accept="application/pdf" 
              />
              
              <div className="flex justify-between items-center">
                <Label>Fichier PDF</Label>
                <Button 
                  type="button" 
                  onClick={handleFileButtonClick}
                  variant="outline"
                  size="sm"
                  className="flex gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  Parcourir
                </Button>
              </div>
              
              {pdfFile ? (
                <div className="bg-gray-100 p-2 rounded-md flex items-center justify-between mt-2">
                  <span className="text-sm truncate">{pdfFile.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setPdfFile(null)}
                    className="h-6 w-6 p-0"
                  >
                    &times;
                  </Button>
                </div>
              ) : (
                <div className={`text-center p-4 border border-dashed rounded-md ${isDraggingOver ? 'border-blue-400' : 'border-gray-300'}`}>
                  <p className="text-sm text-gray-500">
                    {isDraggingOver ? "Déposer votre fichier ici" : "Déposez votre fichier PDF ici ou utilisez le bouton parcourir"}
                  </p>
                </div>
              )}
            </div>
          )}
          
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
