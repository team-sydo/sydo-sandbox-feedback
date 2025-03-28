
import React, { useRef, useState } from 'react';
import { Image, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackFormProps {
  grainId: string;
  projectId: string;
  userId: string;
  currentTime: number | null;
  isVideoType: boolean;
  onFeedbackSubmitted: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  grainId,
  projectId,
  userId,
  currentTime,
  isVideoType,
  onFeedbackSubmitted
}) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner un fichier image",
          variant: "destructive",
        });
        return;
      }
      
      setScreenshotFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Image sélectionnée",
        description: "Votre capture a été ajoutée",
      });
    }
  };
  
  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };
  
  const submitFeedback = async () => {
    if (!content.trim()) return;
    
    try {
      setSubmitting(true);
      
      // Déterminer le timecode pour les vidéos
      const timecode = isVideoType ? currentTime : null;
      
      // Uploader la capture d'écran si elle existe
      let screenshotUrl = null;
      if (screenshotFile) {
        // Générer un nom de fichier unique
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        // Uploader la capture d'écran
        const { error: uploadError } = await supabase.storage
          .from('feedback-screenshots')
          .upload(filePath, screenshotFile, {
            contentType: screenshotFile.type,
          });
        
        if (uploadError) throw uploadError;
        
        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('feedback-screenshots')
          .getPublicUrl(filePath);
        
        screenshotUrl = urlData.publicUrl;
      }
      
      // Créer le feedback dans la base de données
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          grain_id: grainId,
          project_id: projectId,
          content,
          timecode,
          screenshot_url: screenshotUrl,
          user_id: userId,
          done: false
        });
      
      if (error) throw error;
      
      // Réinitialiser le formulaire
      setContent('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Commentaire envoyé",
        description: "Votre commentaire a été enregistré avec succès",
      });
      
      // Notifier le parent que le feedback a été soumis
      onFeedbackSubmitted();
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center px-4 py-3 gap-2 border-t bg-white">
      <input
        type="text"
        placeholder="Ajouter un commentaire..."
        value={content}
        onChange={handleContentChange}
        className="flex-1 py-2 px-3 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleCaptureClick} 
        disabled={submitting}
        className="text-gray-600 whitespace-nowrap"
      >
        <Image className="h-4 w-4 mr-2" />
        Capture
      </Button>
      
      <Button
        size="sm"
        onClick={submitFeedback}
        disabled={!content.trim() || submitting}
        className="bg-blue-500 hover:bg-blue-600"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FeedbackForm;
