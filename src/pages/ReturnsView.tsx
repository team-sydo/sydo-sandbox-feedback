
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { ProjectsList } from "@/components/dashboard/ProjectsList";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define Project interface
export interface Project {
  id: string;
  title: string;
  description: string | null;
  client_name?: string | null;
  client_id?: string | null;
  clients?: {
    id: string;
    nom: string;
  };
  active: boolean;
  created_at?: string;
  user_id?: string;
  sites?: number;
  videos?: number;
}

export default function ReturnsView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const { toast } = useToast();
  const { favoriteProjectIds, toggleFavorite } = useFavorites();

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

  // Fonction pour gérer la création d'un projet
  const handleProjectCreated = () => {
    setIsNewProjectDialogOpen(false);
    fetchProjects();
    toast({
      title: "Projet créé",
      description: "Votre projet a été créé avec succès",
    });
  };

  // Filtrer les projets en fonction du filtre sélectionné
  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.active;
    if (filter === 'archived') return !project.active;
    if (filter === 'favorites') return favoriteProjectIds.includes(project.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Retours</h1>
            <div className="flex items-center gap-4">
              <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as 'all' | 'active' | 'archived' | 'favorites')}>
                <ToggleGroupItem value="all">Tous</ToggleGroupItem>
                <ToggleGroupItem value="active">Actifs</ToggleGroupItem>
                <ToggleGroupItem value="archived">Archivés</ToggleGroupItem>
                <ToggleGroupItem value="favorites">Favoris</ToggleGroupItem>
              </ToggleGroup>
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
                <ToggleGroupItem value="grid" aria-label="Vue grille">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Vue liste">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <Button onClick={() => setIsNewProjectDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter un projet
          </Button>
        </div>

        {viewMode === 'grid' ? (
          <ProjectsList
            projects={filteredProjects}
            loading={loading}
            onDeleteProject={handleDeleteProject}
            onToggleFavorite={toggleFavorite}
            favoriteProjectIds={favoriteProjectIds}
          />
        ) : (
          <ProjectsTable
            projects={filteredProjects}
            loading={loading}
            onDeleteProject={handleDeleteProject}
            onToggleFavorite={toggleFavorite}
            favoriteProjectIds={favoriteProjectIds}
          />
        )}
      </main>

      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
