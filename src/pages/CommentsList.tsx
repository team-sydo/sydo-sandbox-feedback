
import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NavBar } from "@/components/NavBar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectComments } from "@/hooks/useProjectComments";
import { CommentsFilters } from "@/components/comments/CommentsFilters";
import { CommentsTable } from "@/components/comments/CommentsTable";
import { formatTimecode } from "@/utils/formatting";
import { GuestForm } from "@/components/GuestForm";
import { useToast } from "@/hooks/use-toast";

interface Guest {
  id: string;
  prenom: string;
  nom: string;
  poste: string | null;
  device: "mobile" | "ordinateur" | "tablette";
  navigateur: "chrome" | "edge" | "firefox" | "safari" | "autre";
  project_id: string;
}

export default function CommentsList() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [guestCreated, setGuestCreated] = useState(false);
  const [displayActions, setDisplayActions] = useState(true);
  const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const {
    loading,
    projectTitle,
    grains,
    feedbacks,
    authors,
    selectedGrainId,
    setSelectedGrainId,
    statusFilter,
    setStatusFilter,
    selectedAuthorId,
    setSelectedAuthorId,
    toggleFeedbackStatus,
    updateFeedback,
    deleteFeedback,
    fetchFeedbacks,
  } = useProjectComments(projectId);
  
  const userName = user
    ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
    : "";
    
  // Handle initial page load with URL params
  useEffect(() => {
    if (!loading && grains.length > 0 && !initialLoadDone) {
      const grainFromUrl = searchParams.get("grain");
      if (grainFromUrl) {
        setSelectedGrainId(grainFromUrl);
        fetchFeedbacks();
      }
      setInitialLoadDone(true);
    }
  }, [loading, grains, initialLoadDone, searchParams, setSelectedGrainId, fetchFeedbacks]);
  
  useEffect(() => {
    // Afficher le formulaire d'invité uniquement si l'utilisateur n'est pas connecté
    // et qu'aucun invité n'a été créé pour cette session
    if (!user && !guestCreated) {
      setIsGuestFormOpen(true);
      setDisplayActions(false);
    } else {
      setDisplayActions(true);
    }
  }, [user, guestCreated, displayActions]);

  const handleGuestSubmit = (guest: Omit<Guest, "id">) => {
    setGuestCreated(true);
    setIsGuestFormOpen(false);

    toast({
      title: "Bienvenue !",
      description: `Merci de votre participation, ${guest.prenom}`,
    });
  };

  // Handle initial grain ID change from URL
  const handleInitialGrainIdChange = (grainId: string | null) => {
    if (grainId && !initialLoadDone) {
      fetchFeedbacks();
      setInitialLoadDone(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userName} />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to={`/project/${projectId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{projectTitle}</h1>
          <h2 className="text-xl text-gray-600 mt-2">Liste des commentaires</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <CommentsFilters 
            grains={grains}
            authors={authors}
            selectedGrainId={selectedGrainId}
            setSelectedGrainId={setSelectedGrainId}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selectedAuthorId={selectedAuthorId}
            setSelectedAuthorId={setSelectedAuthorId}
            onRefresh={fetchFeedbacks}
            onInitialGrainIdChange={handleInitialGrainIdChange}
          />

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement des commentaires...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Aucun commentaire trouvé pour ce projet.
              </p>
            </div>
          ) : (
            <CommentsTable 
              feedbacks={feedbacks}
              toggleFeedbackStatus={toggleFeedbackStatus}
              formatTimecode={formatTimecode}
              updateFeedback={updateFeedback}
              deleteFeedback={deleteFeedback}
              displayActions={displayActions}
            />
          )}
        </div>
      </main>
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
