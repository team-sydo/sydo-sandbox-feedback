
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Author, Feedback, UserData } from "./useProjectComments";

export function useFeedbacksData(
  projectId: string | undefined,
  selectedGrainId: string | null,
  statusFilter: "all" | "done" | "pending",
  selectedAuthorId: string | null,
  toast: any
) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const fetchFeedbacks = useCallback(async () => {
    if (!projectId) return;

    try {
      console.log("Fetching feedbacks with filters:", {
        selectedGrainId,
        statusFilter,
        selectedAuthorId
      });
      
      let query = supabase
        .from("feedbacks")
        .select(
          `
          *,
          grain:grain_id(title)
        `
        )
        .eq("project_id", projectId);

      if (selectedGrainId) {
        query = query.eq("grain_id", selectedGrainId);
      }

      if (statusFilter === "done") {
        query = query.eq("done", true);
      } else if (statusFilter === "pending") {
        query = query.eq("done", false);
      }

      if (selectedAuthorId) {
        const authors = await fetchAuthorsForFeedbacks(feedbacks);
        const selectedAuthor = authors.find(author => author.id === selectedAuthorId);
        if (selectedAuthor) {
          if (selectedAuthor.type === "user") {
            query = query.eq("user_id", selectedAuthorId);
          } else {
            query = query.eq("guest_id", selectedAuthorId);
          }
        }
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      if (data) {
        const processedFeedbacks = await processRawFeedbacks(data);
        console.log("Loaded feedbacks:", processedFeedbacks.length);
        setFeedbacks(processedFeedbacks);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des feedbacks:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      });
    }
  }, [projectId, selectedGrainId, statusFilter, selectedAuthorId, toast]);

  return { feedbacks, setFeedbacks, fetchFeedbacks };
}

async function processRawFeedbacks(rawFeedbacks: any[]): Promise<Feedback[]> {
  const processedFeedbacks: Feedback[] = rawFeedbacks.map((item) => {
    return {
      ...item,
      user: null,
      guest: null,
      grain:
        typeof item.grain === "object" && item.grain !== null
          ? item.grain
          : null,
    };
  });

  for (let i = 0; i < processedFeedbacks.length; i++) {
    const feedback = processedFeedbacks[i];

    if (feedback.user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("nom, prenom, device, navigateur")
        .eq("id", feedback.user_id)
        .single();

      if (userData) {
        processedFeedbacks[i].user = userData as UserData;
      }
    }

    if (feedback.guest_id) {
      const { data: guestData } = await supabase
        .from("guests")
        .select("nom, prenom, device, navigateur, poste")
        .eq("id", feedback.guest_id)
        .single();

      if (guestData) {
        processedFeedbacks[i].guest = guestData as UserData;
      }
    }
  }

  return processedFeedbacks;
}

async function fetchAuthorsForFeedbacks(feedbacks: Feedback[]): Promise<Author[]> {
  const authors: Author[] = [];
  
  for (const feedback of feedbacks) {
    if (feedback.user_id && feedback.user && !authors.some(a => a.id === feedback.user_id)) {
      authors.push({
        id: feedback.user_id,
        name: `${feedback.user.prenom} ${feedback.user.nom}`,
        device: feedback.user.device,
        navigateur: feedback.user.navigateur,
        poste: "",
        type: "user"
      });
    }
    
    if (feedback.guest_id && feedback.guest && !authors.some(a => a.id === feedback.guest_id)) {
      authors.push({
        id: feedback.guest_id,
        name: `${feedback.guest.prenom} ${feedback.guest.nom}`,
        device: feedback.guest.device,
        navigateur: feedback.guest.navigateur,
        poste: feedback.guest.poste,
        type: "guest"
      });
    }
  }
  
  return authors;
}
