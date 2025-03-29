
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  nom: string;
  prenom: string;
}

export interface Author {
  id: string;
  name: string;
  type: "user" | "guest";
}

export interface Feedback {
  id: string;
  content: string;
  created_at: string;
  done: boolean;
  grain_id: string;
  guest_id: string | null;
  screenshot_url: string | null;
  timecode: number | null;
  user_id: string | null;
  guest?: UserData | null;
  user?: UserData | null;
  grain?: {
    title: string;
  } | null;
}

export interface Grain {
  id: string;
  title: string;
}

export function useProjectComments(projectId: string | undefined) {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState("");
  const [grains, setGrains] = useState<Grain[]>([]);
  const [selectedGrainId, setSelectedGrainId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "pending">(
    "all"
  );
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("title")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      if (projectData) setProjectTitle(projectData.title);

      const { data: grainsData, error: grainsError } = await supabase
        .from("grains")
        .select("id, title")
        .eq("project_id", projectId)
        .order("title");

      if (grainsError) throw grainsError;
      if (grainsData) setGrains(grainsData);

      await fetchFeedbacks();
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du projet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    if (!projectId) return;

    try {
      // Use the projectId directly to filter feedbacks
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
        // Process the feedbacks
        const processedFeedbacks: Feedback[] = data.map((item) => {
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

        // Create a temporary list of authors
        const tempAuthors: Author[] = [];

        // Fetch user and guest information
        for (let i = 0; i < processedFeedbacks.length; i++) {
          const feedback = processedFeedbacks[i];

          if (feedback.user_id) {
            const { data: userData } = await supabase
              .from("users")
              .select("nom, prenom")
              .eq("id", feedback.user_id)
              .single();

            if (userData) {
              processedFeedbacks[i].user = userData as UserData;
              
              // Add user to authors list if not already there
              if (!tempAuthors.some(author => author.id === feedback.user_id)) {
                tempAuthors.push({
                  id: feedback.user_id,
                  name: `${userData.prenom} ${userData.nom}`,
                  type: "user"
                });
              }
            }
          }

          if (feedback.guest_id) {
            const { data: guestData } = await supabase
              .from("guests")
              .select("nom, prenom")
              .eq("id", feedback.guest_id)
              .single();

            if (guestData) {
              processedFeedbacks[i].guest = guestData as UserData;
              
              // Add guest to authors list if not already there
              if (!tempAuthors.some(author => author.id === feedback.guest_id)) {
                tempAuthors.push({
                  id: feedback.guest_id,
                  name: `${guestData.prenom} ${guestData.nom}`,
                  type: "guest"
                });
              }
            }
          }
        }

        // Update the authors state
        setAuthors(tempAuthors);
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
  };

  const toggleFeedbackStatus = async (
    feedbackId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ done: !currentStatus })
        .eq("id", feedbackId);

      if (error) throw error;

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
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du commentaire",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId, toast]);

  useEffect(() => {
    fetchFeedbacks();
  }, [selectedGrainId, statusFilter, selectedAuthorId, projectId]);

  return {
    loading,
    projectTitle,
    grains,
    feedbacks,
    authors,
    selectedGrainId,
    setSelectedGrainId,
    statusFilter,
    setStatusFilter,
    selectedAuthorId,
    setSelectedAuthorId,
    toggleFeedbackStatus,
    fetchFeedbacks
  };
}
