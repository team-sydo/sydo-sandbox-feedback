import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/ProjectCard";
import { TaskList } from "@/components/Tasks/TaskList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { favoriteProjectIds, loading: favoritesLoading } = useFavorites();
  const { tasks, isLoading: tasksLoading, refetch } = useTasks();

  const { data: favoriteProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["favoriteProjects", favoriteProjectIds],
    queryFn: async () => {
      if (!favoriteProjectIds.length) return [];
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .in("id", favoriteProjectIds);

      if (error) throw error;
      return data || [];
    },
    enabled: favoriteProjectIds.length > 0,
  });

  const isLoading = favoritesLoading || projectsLoading || tasksLoading;
  const userTasks = tasks.slice(0, 5); // Limiter à 5 tâches pour l'aperçu

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-8">
        {/* User Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Bienvenue, {user?.user_metadata?.prenom || "Utilisateur"}
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="flex gap-4 w-full">
          {/* Favorites Section */}
          <div className="w-2/3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mes Projets Favoris</CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">Voir tous</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-muted animate-pulse rounded-lg"
                      />
                    ))}
                  </div>
                ) : favoriteProjects?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        client={project.client_id || ""}
                        description={project.description || ""}
                        sites={0}
                        videos={0}
                        status={project.active ? "actif" : "archivé"}
                        isFavorite={true}
                      />
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
          {/* Tasks Section */}
          <div className="w-1/3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Todo</CardTitle>
                {/* <Button asChild variant="outline" size="sm">
                  <Link to="/tasks">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une tâche
                  </Link>
                </Button> */}
                <Button asChild variant="outline" size="sm">
                  <Link to="/tasks">Voir toutes</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="h-32 bg-muted animate-pulse rounded-lg" />
                ) : userTasks?.length ? (
                  <TaskList
                    tasks={userTasks}
                    onEdit={() => {}}
                    refetch={refetch}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore de tâches.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
