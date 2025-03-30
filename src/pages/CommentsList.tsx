
import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NavBar } from "@/components/NavBar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectComments } from "@/hooks/useProjectComments";
import { CommentsFilters } from "@/components/comments/CommentsFilters";
import { CommentsTable } from "@/components/comments/CommentsTable";
import { formatTimecode } from "@/utils/formatting";
import { GuestSelectionModal } from "@/components/guest/GuestSelectionModal";
import { useGuestSession } from "@/hooks/useGuestSession";

export default function CommentsList() {
  const { projectId } = useParams();
  const { user } = useAuth();
  
  // Guest session management
  const {
    guestData,
    showGuestModal,
    setGuestSession,
    promptGuestSelection,
    setShowGuestModal
  } = useGuestSession();
  
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
    fetchFeedbacks
  } = useProjectComments(projectId, user, guestData);

  // Check if needs guest modal on component mount
  useEffect(() => {
    if (!user && !guestData) {
      promptGuestSelection();
    }
  }, [user, guestData, promptGuestSelection]);

  const userName = user
    ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar 
        userName={userName} 
        isProjectPage={true} 
        onGuestPrompt={promptGuestSelection} 
        guestData={guestData}
      />

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
            />
          )}
        </div>
      </main>

      {/* Guest selection modal */}
      {showGuestModal && projectId && (
        <GuestSelectionModal
          projectId={projectId}
          onClose={() => setShowGuestModal(false)}
          onGuestSelected={setGuestSession}
        />
      )}
    </div>
  );
}
