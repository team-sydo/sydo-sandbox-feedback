
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
        
        // Requête pour récupérer les projets
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            clients (id, nom)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Ajouter manuellement le comptage des sites et vidéos
        const projectsWithCounts: Project[] = [];
        
        for (const project of (data || [])) {
          // Compter les grains de type 'web'
          const { count: sitesCount, error: sitesError } = await supabase
            .from('grains')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .eq('type', 'web');
            
          // Compter les grains de type 'video'
          const { count: videosCount, error: videosError } = await supabase
            .from('grains')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .eq('type', 'video');
            
          if (sitesError) console.error("Error counting sites:", sitesError);
          if (videosError) console.error("Error counting videos:", videosError);
          
          // Créer un nouvel objet avec toutes les propriétés typées correctement
          const projectWithCounts: Project = {
            ...project,
            sites: sitesCount || 0,
            videos: videosCount || 0,
            client_name: project.clients ? project.clients.nom : null
          };
          
          projectsWithCounts.push(projectWithCounts);
        }
        
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
        />
      </main>
    </div>
  );
}
