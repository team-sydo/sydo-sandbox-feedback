
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatTimecode } from "@/utils/formatting";

interface FeedbackFormProps {
  grainId: string;
  projectId: string;
  userId: string | null;
  guestId?: string | null;
  currentTime: number | null;
  isVideoType: boolean;
  onFeedbackSubmitted: () => void;
}

export default function FeedbackForm({
  grainId,
  projectId,
  userId,
  guestId = null,
  currentTime,
  isVideoType,
  onFeedbackSubmitted,
}: FeedbackFormProps) {
  const [feedbackContent, setFeedbackContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackContent.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un commentaire",
        variant: "destructive",
      });
      return;
    }

    if (!userId && !guestId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté ou avoir un profil invité pour laisser un commentaire",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const feedbackData = {
        grain_id: grainId,
        project_id: projectId,
        user_id: userId,
        guest_id: guestId,
        content: feedbackContent,
        timecode: isVideoType ? currentTime : null,
      };

      const { error } = await supabase.from("feedbacks").insert(feedbackData);

      if (error) throw error;

      setFeedbackContent("");
      onFeedbackSubmitted();

      toast({
        title: "Succès",
        description: "Votre commentaire a été envoyé",
      });
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du feedback:", error);
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible d'envoyer votre commentaire",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <div className="flex-1">
          <Textarea
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="min-h-20 resize-none"
          />
          {isVideoType && currentTime !== null && (
            <div className="text-xs text-gray-500 mt-1">
              Timecode: {formatTimecode(currentTime)}
            </div>
          )}
        </div>
        <Button type="submit" disabled={submitting}>
          <MessageSquare className="h-4 w-4 mr-2" />
          {submitting ? "Envoi..." : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
