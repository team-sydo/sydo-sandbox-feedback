
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/dashboard/types";
import { NavBar } from "@/components/layouts";
import { ProjectsList } from "@/components/features/dashboard/ProjectsList";
import { useToast } from "@/hooks/use-toast";
import { NewProjectDialog } from "@/components/features/dashboard/NewProjectDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger les projets";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Récupérer les projets de l'utilisateur au chargement
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);



  // Fonction pour supprimer un projet
  const handleDeleteProject = useCallback(async (projectId: string) => {
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
        .eq('id', projectId)
        .eq('user_id', user.id);  // Sécurité supplémentaire
        
      if (projectError) throw projectError;
      
      // Mettre à jour la liste des projets
      setProjects(projects => projects.filter(project => project.id !== projectId));
      
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de supprimer le projet";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Filtrer les projets en fonction du filtre sélectionné
  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.active;
    if (filter === 'archived') return !project.active;
    return true;
  });

  // Gérer la création d'un nouveau projet
  const handleProjectCreated = useCallback(() => {
    setIsNewProjectDialogOpen(false);
    // Recharger les projets
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

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
              <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as 'all' | 'active' | 'archived')}>
                <ToggleGroupItem value="all">Tous</ToggleGroupItem>
                <ToggleGroupItem value="active">Actifs</ToggleGroupItem>
                <ToggleGroupItem value="archived">Archivés</ToggleGroupItem>
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
