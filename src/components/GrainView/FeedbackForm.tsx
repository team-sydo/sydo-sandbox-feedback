
import React, { useRef, useState } from 'react';
import { Image, Send, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageAnnotationModal from './ImageAnnotationModal';
import { Input } from '@/components/ui/input';

interface FeedbackFormProps {
  grainId: string;
  projectId: string;
  userId: string;
  guestId?: string | null; 
  currentTime: number | null;
  isVideoType: boolean;
  onFeedbackSubmitted: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  grainId,
  projectId,
  userId,
  guestId,
  currentTime,
  isVideoType,
  onFeedbackSubmitted
}) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive"
      });
      return;
    }
    setScreenshotFile(file);
    setIsAnnotationModalOpen(true);
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  const handleTogglePlayPause = () => {
    const newPlayState = !isVideoPlaying;
    
    const event = new CustomEvent('toggle-video-playback', {
      detail: {
        isPlaying: newPlayState
      }
    });
    document.dispatchEvent(event);

    setIsVideoPlaying(newPlayState);
  };

  React.useEffect(() => {
    const handlePlayStateChange = (event: CustomEvent) => {
      setIsVideoPlaying(event.detail.isPlaying);
    };
    document.addEventListener('video-play-state-changed', handlePlayStateChange as EventListener);
    return () => {
      document.removeEventListener('video-play-state-changed', handlePlayStateChange as EventListener);
    };
  }, []);

  const handleAnnotationSubmit = async (annotationContent: string, annotatedImageUrl: string) => {
    if (!annotationContent.trim()) return;
    try {
      setSubmitting(true);

      const timecode = isVideoType ? currentTime : null;

      const base64Response = await fetch(annotatedImageUrl);
      const blob = await base64Response.blob();
      const annotatedFile = new File([blob], `annotation-${Date.now()}.png`, {
        type: 'image/png'
      });

      const fileExt = 'png';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const {
        error: uploadError
      } = await supabase.storage.from('feedback-screenshots').upload(filePath, annotatedFile, {
        contentType: 'image/png'
      });
      if (uploadError) throw uploadError;

      const {
        data: urlData
      } = supabase.storage.from('feedback-screenshots').getPublicUrl(filePath);
      const screenshotUrl = urlData.publicUrl;

      // Update to include guestId in the feedback submission
      const {
        error
      } = await supabase.from('feedbacks').insert({
        grain_id: grainId,
        project_id: projectId,
        content: annotationContent,
        timecode,
        screenshot_url: screenshotUrl,
        user_id: userId || null,
        guest_id: guestId || null,
        done: false
      });
      if (error) throw error;

      setContent('');
      setScreenshotFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast({
        title: "Commentaire envoyé",
        description: "Votre commentaire avec annotation a été enregistré avec succès"
      });

      onFeedbackSubmitted();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le commentaire",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeedback = async () => {
    if (!content.trim()) return;
    try {
      setSubmitting(true);

      const timecode = isVideoType ? currentTime : null;

      let screenshotUrl = null;
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const {
          error: uploadError
        } = await supabase.storage.from('feedback-screenshots').upload(filePath, screenshotFile, {
          contentType: screenshotFile.type
        });
        if (uploadError) throw uploadError;

        const {
          data: urlData
        } = supabase.storage.from('feedback-screenshots').getPublicUrl(filePath);
        screenshotUrl = urlData.publicUrl;
      }

      // Update to include guestId in the feedback submission
      const {
        error
      } = await supabase.from('feedbacks').insert({
        grain_id: grainId,
        project_id: projectId,
        content,
        timecode,
        screenshot_url: screenshotUrl,
        user_id: userId || null,
        guest_id: guestId || null,
        done: false
      });
      if (error) throw error;

      setContent('');
      setScreenshotFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast({
        title: "Commentaire envoyé",
        description: "Votre commentaire a été enregistré avec succès"
      });

      onFeedbackSubmitted();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le commentaire",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center px-4 py-3 gap-2 border-t bg-white">
      {isVideoType && <Button size="sm" onClick={handleTogglePlayPause} className="w-16 bg-blue-500 hover:bg-blue-900">
          {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>}

      <div 
        ref={inputContainerRef}
        className={`flex-1 relative ${isDraggingOver ? 'bg-blue-50 border border-blue-300' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Input 
          type="text" 
          placeholder="Ajouter un commentaire..." 
          value={content} 
          onChange={handleContentChange} 
          className="flex-1 py-2 px-3 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary w-full"
        />
        {isDraggingOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-80 pointer-events-none">
            <p className="text-sm text-blue-600 font-medium">Déposer l'image ici</p>
          </div>
        )}
      </div>
      
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      
      <Button variant="outline" size="sm" onClick={handleCaptureClick} disabled={submitting} className="text-gray-600 whitespace-nowrap">
        <Image className="h-4 w-4 mr-2" />
        Capture
      </Button>
      
      <Button size="sm" onClick={submitFeedback} disabled={!content.trim() || submitting} className="bg-blue-500 hover:bg-blue-600">
        <Send className="h-4 w-4" />
      </Button>
      
      <ImageAnnotationModal isOpen={isAnnotationModalOpen} onClose={() => setIsAnnotationModalOpen(false)} imageFile={screenshotFile} onSubmit={handleAnnotationSubmit} timecode={currentTime} />
    </div>
  );
};

export default FeedbackForm;
