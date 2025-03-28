
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "./types";
import { NavBar } from "@/components/NavBar";
import { ProjectsList } from "./components/ProjectsList";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Récupérer les projets de l'utilisateur au chargement
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            clients (id, nom),
            (
              SELECT count(*) FROM grains WHERE project_id = projects.id AND type = 'web'
            ) as sites,
            (
              SELECT count(*) FROM grains WHERE project_id = projects.id AND type = 'video'
            ) as videos
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setProjects(data || []);
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

    fetchProjects();
  }, [user, toast]);

  // Get user name for NavBar
  const userName = user ? `${user.user_metadata.prenom} ${user.user_metadata.nom}` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userName} />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Projets</h1>
        <ProjectsList 
          projects={projects} 
          loading={loading} 
          onProjectCreated={(newProject) => {
            setProjects(prev => [newProject, ...prev]);
          }}
        />
      </main>
    </div>
  );
}
