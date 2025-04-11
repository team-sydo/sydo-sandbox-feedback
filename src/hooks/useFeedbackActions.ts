
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Feedback } from "./useProjectComments";

export function useFeedbackActions(
  feedbacks: Feedback[],
  setFeedbacks: Dispatch<SetStateAction<Feedback[]>>,
  toast: any
) {
  const toggleFeedbackStatus = async (
    feedbackId: string,
    currentStatus: boolean
  ) => {
    try {
      console.log(`Toggling feedback status for ID ${feedbackId}: ${currentStatus} -> ${!currentStatus}`);
      
      // Update in Supabase
      const { error, data } = await supabase
        .from("feedbacks")
        .update({ done: !currentStatus })
        .eq("id", feedbackId)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Supabase update result:", data);

      // Update local state
      setFeedbacks(
        feedbacks.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, done: !currentStatus }
            : feedback
        )
      );

      toast({
        title: "Succès",
        description: currentStatus
          ? "Le commentaire a été marqué comme non traité"
          : "Le commentaire a été marqué comme traité",
      });
    } catch (error: any) {
      console.error("Error toggling feedback status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du commentaire",
        variant: "destructive",
      });
    }
  };

  const updateFeedback = async (feedbackId: string, content: string) => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq("id", feedbackId);

      if (error) throw error;

      setFeedbacks(
        feedbacks.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, content }
            : feedback
        )
      );

      toast({
        title: "Succès",
        description: "Le commentaire a été mis à jour",
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du commentaire:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le commentaire",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .delete()
        .eq("id", feedbackId);

      if (error) throw error;

      setFeedbacks(feedbacks.filter((feedback) => feedback.id !== feedbackId));

      toast({
        title: "Succès",
        description: "Le commentaire a été supprimé",
      });
    } catch (error: any) {
      console.error("Erreur lors de la suppression du commentaire:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { toggleFeedbackStatus, updateFeedback, deleteFeedback };
}
