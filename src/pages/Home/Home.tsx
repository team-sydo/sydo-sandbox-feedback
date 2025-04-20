
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/ProjectCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const { user } = useAuth();
  const { favoriteProjectIds, loading: favoritesLoading } = useFavorites();

  const { data: favoriteProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['favoriteProjects', favoriteProjectIds],
    queryFn: async () => {
      if (!favoriteProjectIds.length) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('id', favoriteProjectIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: favoriteProjectIds.length > 0,
  });

  const isLoading = favoritesLoading || projectsLoading;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-8">
        {/* User Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Bienvenue, {user?.user_metadata?.prenom || 'Utilisateur'}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Favorites Section */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Projets Favoris</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : favoriteProjects?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Vous n'avez pas encore de projets favoris.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
