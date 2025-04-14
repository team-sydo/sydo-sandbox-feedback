
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [guestCreated, setGuestCreated] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [displayActions, setDisplayActions] = useState(true);
  const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);
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

  useEffect(() => {
    if (!user && !guestCreated) {
      setIsGuestFormOpen(true);
      setDisplayActions(false);
    } else {
      // If user is logged in, always show actions
      // If guest, check if they are on their comments list
      setDisplayActions(!!user);
    }
  }, [user, guestCreated]);

  const handleGuestSubmit = (guestData: Guest) => {
    setGuest(guestData);
    setGuestCreated(true);
    setIsGuestFormOpen(false);

    toast({
      title: "Bienvenue !",
      description: `Merci de votre participation, ${guestData.prenom}`,
    });
    
    // Set the author filter to the guest ID to show only their comments
    setSelectedAuthorId(guestData.id);
    
    // Now we know which guest it is, we can show actions for their own comments
    setDisplayActions(true);
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      // For guests, we add extra check before attempting to delete
      if (!user && guest) {
        const feedbackToDelete = feedbacks.find(f => f.id === feedbackId);
        if (feedbackToDelete && feedbackToDelete.guest_id !== guest.id) {
          toast({
            title: "Action non autorisée",
            description: "Vous ne pouvez supprimer que vos propres commentaires",
            variant: "destructive",
          });
          return;
        }
      }
      
      await deleteFeedback(feedbackId);
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const handleUpdateFeedback = async (feedbackId: string, content: string) => {
    try {
      // For guests, we add extra check before attempting to update
      if (!user && guest) {
        const feedbackToUpdate = feedbacks.find(f => f.id === feedbackId);
        if (feedbackToUpdate && feedbackToUpdate.guest_id !== guest.id) {
          toast({
            title: "Action non autorisée",
            description: "Vous ne pouvez modifier que vos propres commentaires",
            variant: "destructive",
          });
          return;
        }
      }
      
      await updateFeedback(feedbackId, content);
    } catch (error) {
      console.error("Error updating feedback:", error);
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
              updateFeedback={handleUpdateFeedback}
              deleteFeedback={handleDeleteFeedback}
              displayActions={displayActions || !!user || (!!guest && selectedAuthorId === guest.id)}
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
