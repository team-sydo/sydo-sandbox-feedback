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
import { Grain, Guest, Resource } from "@/types";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { ResourcesList } from "@/components/resources/ResourcesList";

interface Project {
  id: string;
  title: string;
  description: string | null;
  client_name?: string | null;
  active: boolean;
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [isResourceFormOpen, setIsResourceFormOpen] = useState(false);

  useEffect(() => {
    if (!user && !guestCreated) {
      setIsGuestFormOpen(true);
    }
  }, [user, guestCreated]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

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
          setError("Projet non trouvé");
          setProject(null);
        }

        const { data: grainsData, error: grainsError } = await supabase
          .from("grains")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (grainsError) throw grainsError;

        setGrains(grainsData || []);
      } catch (error: any) {
        console.error("Error fetching project details:", error);
        setError(
          error.message ||
            "Une erreur s'est produite lors du chargement du projet"
        );
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
    fetchProjectDetails();
  }, [projectId, toast]);

  useEffect(() => {
    const fetchResources = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from("ressources")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setResources(data || []);
      } catch (error: any) {
        console.error("Error fetching resources:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ressources",
          variant: "destructive",
        });
      }
    };

    fetchResources();
  }, [projectId, toast]);

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
        .update({ done: !done })
        .eq("id", grainId);

      if (error) throw error;

      setGrains((prev) =>
        prev.map((grain) => (grain.id === grainId ? { ...grain, done: !done } : grain))
      );

      toast({
        title: "Statut mis à jour",
        description: done
          ? "Grain marqué comme non terminé"
          : "Grain marqué comme terminé",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleRetourToggle = async (grainId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("grains")
        .update({ retour_on: enabled })
        .eq("id", grainId);

      if (error) throw error;

      setGrains((prev) =>
        prev.map((grain) =>
          grain.id === grainId ? { ...grain, retour_on: enabled } : grain
        )
      );

      toast({
        title: "État des retours mis à jour",
        description: enabled ? "Les retours sont maintenant activés" : "Les retours sont maintenant désactivés",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'état des retours",
        variant: "destructive",
      });
    }
  };

  const handleGrainUpdate = (updatedGrain: Grain) => {
    setGrains((prev) =>
      prev.map((grain) => (grain.id === updatedGrain.id ? updatedGrain : grain))
    );
  };

  const handleGrainDelete = (grainId: string) => {
    setGrains((prev) => prev.filter((grain) => grain.id !== grainId));
  };

  const handleGuestSubmit = (guest: Omit<Guest, "id">) => {
    setGuestCreated(true);
    setIsGuestFormOpen(false);

    toast({
      title: "Bienvenue !",
      description: `Merci de votre participation, ${guest.prenom}`,
    });
  };

  const handleResourceAdded = () => {
    const fetchResources = async () => {
      if (!projectId) return;
      
      const { data } = await supabase
        .from("ressources")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      
      if (data) setResources(data);
    };

    fetchResources();
  };

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
        <div className="mb-8">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour aux projets
            </Link>
          ) : (
            ""
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge variant={project.active ? "success" : "destructive"}>
              {project.active ? "Actif" : "Archivé"}
            </Badge>
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

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Éléments à tester</CardTitle>
            </div>
            <div className="flex gap-2">
              {user && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
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
                  </Button>
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
              onGrainUpdate={handleGrainUpdate}
              onGrainDelete={handleGrainDelete}
              onRetourToggle={handleRetourToggle}
            />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ressources</CardTitle>
            </div>
            <div className="flex gap-2">
              {user && (
                <Button onClick={() => setIsResourceFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Ajouter une ressource
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ResourcesList resources={resources} />
          </CardContent>
        </Card>
      </main>

      {isGrainFormOpen && (
        <GrainForm
          projectId={projectId || ""}
          onClose={() => setIsGrainFormOpen(false)}
          onSubmit={handleAddGrain}
        />
      )}

      {isGuestFormOpen && (
        <GuestForm
          projectId={projectId || ""}
          onClose={() => setIsGuestFormOpen(false)}
          onSubmit={handleGuestSubmit}
        />
      )}

      {isResourceFormOpen && (
        <ResourceForm
          projectId={projectId || ""}
          isOpen={isResourceFormOpen}
          onClose={() => setIsResourceFormOpen(false)}
          onResourceAdded={handleResourceAdded}
        />
      )}
    </div>
  );
}
