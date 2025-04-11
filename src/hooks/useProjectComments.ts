
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFeedbacksData } from "./useFeedbacksData";
import { useAuthors } from "./useAuthors";
import { useFeedbackActions } from "./useFeedbackActions";

export interface UserData {
  nom: string;
  prenom: string;
  device: string;
  navigateur: string;
  poste: string;
}

export interface Author {
  id: string;
  name: string;
  device: string;
  navigateur: string;
  poste: string;
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
  const [projectTitle, setProjectTitle] = useState("");
  const [grains, setGrains] = useState<Grain[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedGrainId, setSelectedGrainId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "pending">("all");
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  const { feedbacks, setFeedbacks, fetchFeedbacks } = useFeedbacksData(
    projectId,
    selectedGrainId,
    statusFilter,
    selectedAuthorId,
    toast
  );
  
  const { authors } = useAuthors(feedbacks);
  
  const { toggleFeedbackStatus, updateFeedback, deleteFeedback } = useFeedbackActions(
    feedbacks,
    setFeedbacks,
    toast
  );

  // Fetch project data including title and grains
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

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

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
    fetchFeedbacks,
    updateFeedback,
    deleteFeedback
  };
}
