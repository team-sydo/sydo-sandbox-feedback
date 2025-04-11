
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

      // For author filtering, we'll apply it after fetching the data
      // since we need to fetch user/guest data regardless

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      if (data) {
        const processedFeedbacks = await processRawFeedbacks(data);
        
        // Apply author filter if needed
        let filteredFeedbacks = processedFeedbacks;
        if (selectedAuthorId) {
          filteredFeedbacks = processedFeedbacks.filter(feedback => 
            (feedback.user_id === selectedAuthorId) || 
            (feedback.guest_id === selectedAuthorId)
          );
        }
        
        console.log("Loaded feedbacks:", filteredFeedbacks.length);
        setFeedbacks(filteredFeedbacks);
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

  // Extract all user and guest IDs to fetch in batch
  const userIds = [...new Set(processedFeedbacks
    .filter(f => f.user_id)
    .map(f => f.user_id))];
  
  const guestIds = [...new Set(processedFeedbacks
    .filter(f => f.guest_id)
    .map(f => f.guest_id))];

  // Fetch all users in a single query
  let usersMap: Record<string, UserData> = {};
  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, nom, prenom, device, navigateur")
      .in("id", userIds);
      
    if (usersData) {
      usersMap = usersData.reduce((acc, user) => {
        // Add the missing 'poste' property with an empty string default value
        acc[user.id] = {
          ...user,
          poste: ""
        } as UserData;
        return acc;
      }, {} as Record<string, UserData>);
    }
  }

  // Fetch all guests in a single query
  let guestsMap: Record<string, UserData> = {};
  if (guestIds.length > 0) {
    const { data: guestsData } = await supabase
      .from("guests")
      .select("id, nom, prenom, device, navigateur, poste")
      .in("id", guestIds);
      
    if (guestsData) {
      guestsMap = guestsData.reduce((acc, guest) => {
        acc[guest.id] = guest as UserData;
        return acc;
      }, {} as Record<string, UserData>);
    }
  }

  // Associate users and guests with their respective feedbacks
  for (let i = 0; i < processedFeedbacks.length; i++) {
    const feedback = processedFeedbacks[i];
    
    if (feedback.user_id && usersMap[feedback.user_id]) {
      processedFeedbacks[i].user = usersMap[feedback.user_id];
    }
    
    if (feedback.guest_id && guestsMap[feedback.guest_id]) {
      processedFeedbacks[i].guest = guestsMap[feedback.guest_id];
    }
  }

  return processedFeedbacks;
}
