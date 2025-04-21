
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useTasks() {
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return [];
    
    // Chercher les tâches créées par l'utilisateur ou qui lui sont assignées
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .or(`user_id.eq.${user.id},assigned_to.cs.{${user.id}}`)
      .order("position", { ascending: true });
      
    if (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      throw error;
    }
    
    return data || [];
  };

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: fetchTasks,
    enabled: !!user,
  });

  return { tasks, isLoading, refetch };
}
