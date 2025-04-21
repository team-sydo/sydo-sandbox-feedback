
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useTasks() {
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .or(`user_id.eq.${user.id},assigned_to.cs.{${user.id}}`)
      .order("position", { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    enabled: !!user,
  });

  return { tasks, isLoading, refetch };
}
