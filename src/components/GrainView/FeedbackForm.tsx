
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageAnnotationModal from "./ImageAnnotationModal";  // Default import
import html2canvas from "html2canvas";
import { Camera, Send } from "lucide-react";

interface FeedbackFormProps {
  grainId: string;
  projectId: string;
  userId?: string | null;
  guestId?: string | null;
  currentTime: number | null;
  isVideoType: boolean;
  onFeedbackSubmitted: () => void;
}

export default function FeedbackForm({
  grainId,
  projectId,
  userId,
  guestId,
  currentTime,
  isVideoType,
  onFeedbackSubmitted,
}: FeedbackFormProps) {
  const [content, setContent] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez saisir un commentaire",
        variant: "destructive",
      });
      return;
    }

    if (!userId && !guestId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté ou avoir un profil invité pour envoyer un feedback",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const feedback = {
        grain_id: grainId,
        project_id: projectId,
        content,
        user_id: userId || null,
        guest_id: guestId || null,
        timecode: isVideoType ? currentTime : null,
        screenshot_url: capturedImage,
      };

      const { error } = await supabase.from("feedbacks").insert(feedback);

      if (error) throw error;

      toast({
        title: "Commentaire envoyé",
        description: "Votre commentaire a été enregistré avec succès",
      });

      // Reset form
      setContent("");
      setCapturedImage(null);
      onFeedbackSubmitted();
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le commentaire",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const captureScreenshot = async () => {
    setIsCapturing(true);
    try {
      // Find the parent iframe or video element
      const targetElement = document.querySelector("iframe, video");
      
      if (!targetElement) {
        toast({
          title: "Erreur",
          description: "Impossible de capturer l'écran",
          variant: "destructive",
        });
        return;
      }

      const canvas = await html2canvas(targetElement as HTMLElement);
      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      toast({
        title: "Erreur",
        description: "Impossible de capturer l'écran",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveAnnotation = (annotatedImageData: string) => {
    setCapturedImage(annotatedImageData);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white p-4 border-t">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full resize-none"
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={captureScreenshot}
              disabled={isCapturing || isSubmitting}
              title="Capturer l'écran"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={!content.trim() || isSubmitting}
              title="Envoyer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {capturedImage && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Capture d'écran:</div>
            <div className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
              <img
                src={capturedImage}
                alt="Capture d'écran"
                className="h-full object-contain mx-auto"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-gray-100 rounded-full p-1 text-xs"
                onClick={() => setCapturedImage(null)}
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {isVideoType && currentTime !== null && (
          <div className="text-xs text-gray-500">
            Timecode: {Math.floor(currentTime / 60)}:
            {String(Math.floor(currentTime % 60)).padStart(2, "0")}
          </div>
        )}
      </form>

      {isModalOpen && capturedImage && (
        <ImageAnnotationModal
          imageData={capturedImage}
          onSave={handleSaveAnnotation}
          onClose={() => setIsModalOpen(false)}
          timecode={isVideoType ? currentTime : null}
        />
      )}
    </div>
  );
}
