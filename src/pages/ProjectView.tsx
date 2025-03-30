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
import { ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrainForm } from "@/components/GrainForm";
import { GrainsList } from "@/components/GrainsList";
import { GuestSelectionModal } from "@/components/guest/GuestSelectionModal";
import { useGuestSession } from "@/hooks/useGuestSession";

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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [grains, setGrains] = useState<Grain[]>([]);
  const [isGrainFormOpen, setIsGrainFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Guest session management
  const {
    guestData,
    showGuestModal,
    setGuestSession,
    promptGuestSelection,
    setShowGuestModal
  } = useGuestSession();

  // Check if user is authenticated, if not, show guest modal
  useEffect(() => {
    if (!authLoading && !user && !guestData) {
      promptGuestSelection();
    }
  }, [user, authLoading, guestData, promptGuestSelection]);

  const fetchProjectDetails = async () => {
    if (!projectId) return;

    try {
      setLoading(true);

      // Récupérer les détails du projet
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
        .single();

      if (projectError) throw projectError;

      if (projectData) {
        setProject({
          ...projectData,
          client_name: projectData.clients ? projectData.clients.nom : null,
        });
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
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible de charger les détails du projet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrain = (newGrain: Grain) => {
    setGrains((prev) => [newGrain, ...prev]);
    setIsGrainFormOpen(false);

    toast({
      title: "Succès",
      description: "Le nouveau grain a été ajouté",
    });
  };

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

  // Get user name for NavBar
  const userName = user
    ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
    : "";

  // Don't render anything until we have either a user or guest session (unless loading)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} isProjectPage={true} />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user && !guestData && !showGuestModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar 
          userName={userName} 
          isProjectPage={true} 
          onGuestPrompt={promptGuestSelection}
        />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Veuillez vous identifier pour accéder à ce projet</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} isProjectPage={true} guestData={guestData}/>
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement du projet...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} isProjectPage={true} guestData={guestData}/>
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Projet non trouvé</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate("/dashboard")}
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
      <NavBar 
        userName={userName} 
        isProjectPage={true} 
        onGuestPrompt={promptGuestSelection} 
        guestData={guestData}
      />

      <main className="flex-1 container mx-auto py-8 px-4">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux projets
          </Link>
        </div>

        {/* Informations du projet */}
        <div className="mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold mr-2">{project.title}</h1>
            <Badge variant={project.active ? "success" : "destructive"}>
              {project.active ? "Actif" : "Archivé"}
            </Badge>
          </div>
          {project.client_name && (
            <div className="text-xs text-gray-600 mt-1">
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
              <CardDescription>
                Liste des éléments web et vidéo à tester pour ce projet
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to={`/project/${projectId}/comments`}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Voir tous les retours
                </Link>
              </Button>
              {user && (
                <Button onClick={() => setIsGrainFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un élément
                </Button>
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

      {/* Modal for adding a grain */}
      {isGrainFormOpen && (
        <GrainForm
          projectId={projectId || ""}
          onClose={() => setIsGrainFormOpen(false)}
          onSubmit={handleAddGrain}
        />
      )}

      {/* Guest selection modal */}
      {showGuestModal && (
        <GuestSelectionModal
          projectId={projectId || ""}
          onClose={() => setShowGuestModal(false)}
          onGuestSelected={setGuestSession}
        />
      )}
    </div>
  );
}
