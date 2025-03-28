
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

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
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

  // Filtrer les projets en fonction du filtre sélectionné
  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.active;
    if (filter === 'archived') return !project.active;
    return true;
  });

  // Gérer la création d'un nouveau projet
  const handleProjectCreated = () => {
    setIsNewProjectDialogOpen(false);
    // Recharger les projets
    if (user) {
      // Simple refresh for now - could be optimized to just add the new project
      window.location.reload();
    }
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
