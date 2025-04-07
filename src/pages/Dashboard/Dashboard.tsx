
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "./types";
import { NavBar } from "@/components/NavBar";
import { ProjectsList } from "./components/ProjectsList";
import { useToast } from "@/hooks/use-toast";
import { NewProjectDialog } from "./components/NewProjectDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived' | 'favorites'>('all');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const { toast } = useToast();
  const { favoriteProjectIds, toggleFavorite, isFavorite } = useFavorites();

  // Récupérer tous les projets au chargement
  useEffect(() => {
    fetchProjects();
  }, [user, toast]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      console.log("Fetching all projects from dashboard...");
      
      // Requête pour récupérer tous les projets sans filtre sur user_id
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (id, nom)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }

      console.log("Projects fetched:", data?.length || 0);
      
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
      console.log("Projects with counts:", projectsWithCounts.length);
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

  // Fonction pour supprimer un projet
  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Supprimer d'abord tous les grains associés au projet
      const { error: grainsError } = await supabase
        .from('grains')
        .delete()
        .eq('project_id', projectId);
        
      if (grainsError) throw grainsError;
      
      // Ensuite, supprimer le projet lui-même
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        // Removed the user_id filter to allow deletion of any project
        
      if (projectError) throw projectError;
      
      // Mettre à jour la liste des projets
      setProjects(projects.filter(project => project.id !== projectId));
      
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le projet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les projets en fonction du filtre sélectionné
  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.active;
    if (filter === 'archived') return !project.active;
    if (filter === 'favorites') return favoriteProjectIds.includes(project.id);
    return true;
  });

  // Gérer la création d'un nouveau projet
  const handleProjectCreated = () => {
    setIsNewProjectDialogOpen(false);
    // Recharger les projets
    if (user) {
      fetchProjects();
    }
  };

  // Handle toggling favorites
  const handleToggleFavorite = (projectId: string) => {
    toggleFavorite(projectId);
  };

  // Get user name for NavBar
  const userName = user ? `${user.user_metadata.prenom} ${user.user_metadata.nom}` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userName} />
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projets</h1>
            <div className="mt-4">
              <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as 'all' | 'active' | 'archived' | 'favorites')}>
                <ToggleGroupItem value="all">Tous</ToggleGroupItem>
                <ToggleGroupItem value="active">Actifs</ToggleGroupItem>
                <ToggleGroupItem value="archived">Archivés</ToggleGroupItem>
                <ToggleGroupItem value="favorites">Favoris</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <Button onClick={() => setIsNewProjectDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter un projet
          </Button>
        </div>
        <ProjectsList 
          projects={filteredProjects} 
          loading={loading} 
          onDeleteProject={handleDeleteProject}
          onToggleFavorite={handleToggleFavorite}
          favoriteProjectIds={favoriteProjectIds}
        />
      </main>

      <NewProjectDialog 
        isOpen={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
