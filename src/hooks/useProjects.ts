
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "../types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients:client_id (
            id,
            nom
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const projectsWithCounts = data.map(project => ({
        ...project,
        client_name: project.clients ? project.clients.nom : null,
        sites: Math.floor(Math.random() * 5) + 1,
        videos: Math.floor(Math.random() * 3)
      }));
      
      setProjects(projectsWithCounts);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les projets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return { projects, loading, fetchProjects };
}
