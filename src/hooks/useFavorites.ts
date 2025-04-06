
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user's favorites when the component mounts
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavoriteProjectIds([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_favorites")
        .select("project_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setFavoriteProjectIds(data.map((fav) => fav.project_id));
    } catch (error: any) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (projectId: string) => {
    if (!user) return;

    try {
      const isFavorite = favoriteProjectIds.includes(projectId);

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("project_id", projectId);

        if (error) throw error;

        setFavoriteProjectIds(favoriteProjectIds.filter(id => id !== projectId));
        toast({
          title: "Retiré des favoris",
          description: "Le projet a été retiré de vos favoris",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("user_favorites")
          .insert({ user_id: user.id, project_id: projectId });

        if (error) throw error;

        setFavoriteProjectIds([...favoriteProjectIds, projectId]);
        toast({
          title: "Ajouté aux favoris",
          description: "Le projet a été ajouté à vos favoris",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    }
  };

  return {
    favoriteProjectIds,
    loading,
    toggleFavorite,
    isFavorite: (projectId: string) => favoriteProjectIds.includes(projectId),
  };
}
