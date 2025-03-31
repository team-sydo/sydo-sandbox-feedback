import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Plus, MessageSquare, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrainForm } from "@/components/GrainForm";
import { GrainsList } from "@/components/GrainsList";
import { GuestForm } from "@/components/GuestForm";

interface Project {
  id: string;
  title: string;
  description: string | null;
  client_name?: string | null;
  active: boolean;
}

interface Grain {
  id: string;
  title: string;
  type: "web" | "video";
  url: string;
  done: boolean;
  project_id: string;
}

interface Guest {
  id: string;
  prenom: string;
  nom: string;
  poste: string | null;
  device: "mobile" | "ordinateur" | "tablette";
  navigateur: "chrome" | "edge" | "firefox" | "safari" | "autre";
  project_id: string;
}

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [grains, setGrains] = useState<Grain[]>([]);
  const [isGrainFormOpen, setIsGrainFormOpen] = useState(false);
  const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guestCreated, setGuestCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    // Afficher le formulaire d'invité uniquement si l'utilisateur n'est pas connecté 
    // et qu'aucun invité n'a été créé pour cette session
    if (!user && !guestCreated) {
      setIsGuestFormOpen(true);
    }
  }, [user, guestCreated]);

  // Charger les détails du projet
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        // Récupérer les détails du projet en utilisant maybeSingle au lieu de single
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select(
            `
            *,
            clients:client_id (
              id,
              nom
            )
          `
          )
          .eq("id", projectId)
          .maybeSingle();

        if (projectError) throw projectError;

        if (projectData) {
          setProject({
            ...projectData,
            client_name: projectData.clients ? projectData.clients.nom : null,
          });
        } else {
          // Si aucun projet n'est trouvé, définir un état d'erreur
          setError("Projet non trouvé");
          setProject(null);
        }

        // Récupérer les grains du projet
        const { data: grainsData, error: grainsError } = await supabase
          .from("grains")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (grainsError) throw grainsError;

        setGrains(grainsData || []);
      } catch (error: any) {
        console.error("Error fetching project details:", error);
        setError(error.message || "Une erreur s'est produite lors du chargement du projet");
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger les détails du projet",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId, toast]);

  // Gérer l'ajout d'un nouveau grain
  const handleAddGrain = (newGrain: Grain) => {
    setGrains((prev) => [newGrain, ...prev]);
    setIsGrainFormOpen(false);

    toast({
      title: "Succès",
      description: "Le nouveau grain a été ajouté",
    });
  };

  // Gérer la mise à jour du statut d'un grain
  const handleGrainStatusToggle = async (grainId: string, done: boolean) => {
    try {
      const { error } = await supabase
        .from("grains")
        .update({ done })
        .eq("id", grainId);

      if (error) throw error;

      // Mettre à jour l'état local
      setGrains((prev) =>
        prev.map((grain) => (grain.id === grainId ? { ...grain, done } : grain))
      );

      toast({
        title: "Statut mis à jour",
        description: done
          ? "Grain marqué comme terminé"
          : "Grain marqué comme non terminé",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  // Gérer la soumission du formulaire invité
  const handleGuestSubmit = (guest: Omit<Guest, "id">) => {
    setGuestCreated(true);
    setIsGuestFormOpen(false);

    toast({
      title: "Bienvenue !",
      description: `Merci de votre participation, ${guest.prenom}`,
    });
  };

  // Get user name for NavBar
  const userName = user
    ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
    : "";

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement du projet...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Projet non trouvé</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux projets
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar userName={userName} />

      <main className="flex-1 container mx-auto py-8 px-4">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour aux projets
            </Link>
          ) : ""}
        </div>

        {/* Informations du projet */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge variant={project.active ? "success" : "destructive"}>
              {project.active ? "Actif" : "Archivé"}
            </Badge>
            <button
              className="flex items-center px-2 py-1 text-gray-500 hover:text-gray-700"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Succès",
                  description: "URL copiée dans le presse-papier",
                });
              }}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              Copier l'URL
            </button>
          </div>
          {project.client_name && (
            <div className="text-lg text-gray-600 mt-1">
              {project.client_name}
            </div>
          )}
          {project.description && (
            <p className="mt-2 text-gray-600">{project.description}</p>
          )}
        </div>

        {/* Section des grains */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Éléments à tester</CardTitle>
            </div>
            <div className="flex gap-2">
              {user && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/project/${projectId}/comments`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Voir tous les retours
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => setIsGrainFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Ajouter un élément
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <GrainsList
              grains={grains}
              onStatusToggle={handleGrainStatusToggle}
              isUserLoggedIn={!!user}
            />
          </CardContent>
        </Card>
      </main>

      {/* Modal pour l'ajout d'un grain */}
      {isGrainFormOpen && (
        <GrainForm
          projectId={projectId || ""}
          onClose={() => setIsGrainFormOpen(false)}
          onSubmit={handleAddGrain}
        />
      )}

      {/* Modal pour l'inscription d'un invité */}
      {isGuestFormOpen && (
        <GuestForm
          projectId={projectId || ""}
          onClose={() => setIsGuestFormOpen(false)}
          onSubmit={handleGuestSubmit}
        />
      )}
    </div>
  );
}
