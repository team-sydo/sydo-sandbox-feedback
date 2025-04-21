import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useTasks() {
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return [];
    
    // Chercher les tâches créées par l'utilisateur ou qui lui sont assignées
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .or(`user_id.eq.${user.id},assigned_to.cs.{${user.id}}`)
      .order("position", { ascending: true });
      
    if (tasksError) {
      console.error("Erreur lors de la récupération des tâches:", tasksError);
      throw tasksError;
    }

    // Récupérer les informations des utilisateurs pour l'affichage des assignations
    const userIds = new Set<string>();
    tasks.forEach(task => {
      if (typeof task.user_id === "string") userIds.add(task.user_id);
      if (task.assigned_to && Array.isArray(task.assigned_to)) {
        task.assigned_to.forEach(id => {
          if (typeof id === "string") userIds.add(id);
        });
      }
    });

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, prenom, nom")
      .in('id', Array.from(userIds) as string[]);

    if (usersError) {
      console.error("Erreur lors de la récupération des utilisateurs:", usersError);
      throw usersError;
    }

    // Attacher les informations des utilisateurs aux tâches
    const usersMap = {};
    users.forEach(user => {
      usersMap[user.id] = user;
    });

    const enrichedTasks = tasks.map(task => ({
      ...task,
      creator: usersMap[task.user_id] || { prenom: "Inconnu", nom: "" },
      assignedUsers: task.assigned_to && Array.isArray(task.assigned_to) 
        ? task.assigned_to.map(id => usersMap[id] || { prenom: "Inconnu", nom: "" })
        : []
    }));
    
    return enrichedTasks || [];
  };

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: fetchTasks,
    enabled: !!user,
  });

  return { tasks, isLoading, refetch };
}
