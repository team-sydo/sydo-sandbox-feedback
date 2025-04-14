
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/components/NavBar";
import { ArrowLeft, MessageCircle } from "lucide-react";
import FeedbackForm from "@/components/GrainView/FeedbackForm";
import FeedbacksList from "@/components/GrainView/FeedbacksList";
import VideoPlayer from "@/components/GrainView/VideoPlayer";
import PdfViewer from "@/components/GrainView/PdfViewer";
import { GuestForm } from "@/components/GuestForm";
import { Grain, Guest } from "@/types";
import { EditCommentModal } from "@/components/comments/EditCommentModal";
import { DeleteFeedbackDialog } from "@/components/comments/DeleteFeedbackDialog";
import { Feedback } from "@/hooks/useProjectComments";

export default function GrainView() {
  const { grainId } = useParams<{ grainId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  // États
  const [grain, setGrain] = useState<Grain | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [guestCreated, setGuestCreated] = useState(false);
  const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);
  const [feedbackToEdit, setFeedbackToEdit] = useState<Feedback | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  // Références
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Afficher le formulaire d'invité uniquement si l'utilisateur n'est pas connecté
    // et qu'aucun invité n'a été créé pour cette session
    if (!user && !guestCreated) {
      setIsGuestFormOpen(true);
    }
  }, [user, guestCreated]);

  useEffect(() => {
    const fetchGrainDetails = async () => {
      if (!grainId) return;

      try {
        setLoading(true);

        // Récupérer les détails du grain
        const { data: grainData, error: grainError } = await supabase
          .from("grains")
          .select(
            `
            *,
            project:project_id (
              title
            )
          `
          )
          .eq("id", grainId)
          .single();

        if (grainError) throw grainError;

        setGrain({
          ...grainData,
          project: grainData.project
        });
        
        // Récupérer tous les feedbacks du grain
        await fetchFeedbacks();
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger les détails",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGrainDetails();
  }, [grainId, toast]);
  
  const handleGuestSubmit = (guest: Omit<Guest, "id">) => {
    setGuest(guest as Guest);
    setGuestCreated(true);
    setIsGuestFormOpen(false);

    toast({
      title: "Bienvenue !",
      description: `Merci de votre participation, ${guest.prenom}`,
    });
  };

  const fetchFeedbacks = async () => {
    if (!grainId) return;

    try {
      // Récupérer tous les feedbacks liés au grain sans essayer de joindre directement
      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("grain_id", grainId)
        .order("created_at", { ascending: false });

      if (feedbacksError) throw feedbacksError;

      // Initialiser la liste des feedbacks
      const processedFeedbacks: Feedback[] = feedbacksData.map(feedback => ({
        ...feedback,
        user: null,
        guest: null
      }));

      // Récupérer tous les utilisateurs et invités nécessaires
      const userIds = [...new Set(processedFeedbacks.filter(f => f.user_id).map(f => f.user_id))];
      const guestIds = [...new Set(processedFeedbacks.filter(f => f.guest_id).map(f => f.guest_id))];

      // Récupérer les données des utilisateurs
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, nom, prenom, device, navigateur")
          .in("id", userIds as string[]);

        if (usersData) {
          // Associer les utilisateurs aux feedbacks
          processedFeedbacks.forEach(feedback => {
            if (feedback.user_id) {
              const userData = usersData.find(u => u.id === feedback.user_id);
              if (userData) {
                feedback.user = {
                  ...userData,
                  poste: "" // Ajout de la propriété poste manquante
                };
              }
            }
          });
        }
      }

      // Récupérer les données des invités
      if (guestIds.length > 0) {
        const { data: guestsData } = await supabase
          .from("guests")
          .select("id, nom, prenom, device, navigateur, poste")
          .in("id", guestIds as string[]);

        if (guestsData) {
          // Associer les invités aux feedbacks
          processedFeedbacks.forEach(feedback => {
            if (feedback.guest_id) {
              const guestData = guestsData.find(g => g.id === feedback.guest_id);
              if (guestData) {
                feedback.guest = guestData;
              }
            }
          });
        }
      }

      setFeedbacks(processedFeedbacks);
    } catch (error: any) {
      console.error("Erreur lors du chargement des feedbacks:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      });
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const toggleFeedbackStatus = async (
    feedbackId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ done: !currentStatus })
        .eq("id", feedbackId);

      if (error) throw error;

      // Mettre à jour l'état local
      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, done: !currentStatus }
            : feedback
        )
      );

      toast({
        title: currentStatus ? "Feedback rouvert" : "Feedback résolu",
        description: currentStatus
          ? "Le feedback a été marqué comme non résolu"
          : "Le feedback a été marqué comme résolu",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleEditFeedback = (feedback: Feedback) => {
    // Check if current user is the guest who created the feedback
    if (!user && guest && feedback.guest_id !== guest.id) {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez modifier que vos propres commentaires",
        variant: "destructive",
      });
      return;
    }
    
    setFeedbackToEdit(feedback);
  };

  const handleUpdateFeedback = async (id: string, content: string) => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ content })
        .eq("id", id);

      if (error) throw error;

      // Mettre à jour l'état local
      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback.id === id ? { ...feedback, content } : feedback
        )
      );

      setFeedbackToEdit(null);

      toast({
        title: "Succès",
        description: "Le commentaire a été mis à jour",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le commentaire",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (feedbackId: string, guestId: string | null) => {
    // Check if current user is the guest who created the feedback
    if (!user && guest && guestId !== guest.id) {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez supprimer que vos propres commentaires",
        variant: "destructive",
      });
      return;
    }
    
    setFeedbackToDelete(feedbackId);
  };

  const handleDeleteFeedback = async () => {
    if (!feedbackToDelete) return;

    try {
      const { error } = await supabase
        .from("feedbacks")
        .delete()
        .eq("id", feedbackToDelete);

      if (error) throw error;

      // Mettre à jour l'état local
      setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== feedbackToDelete));

      setFeedbackToDelete(null);

      toast({
        title: "Succès",
        description: "Le commentaire a été supprimé",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
    }
  };

  // Get user name for NavBar
  const userName = user
    ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
    : "";

  if (loading && !grain) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Chargement...</p>
        </main>
      </div>
    );
  }

  if (!grain) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Élément non trouvé</p>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden w-full bg-gray-50">
      <NavBar userName={userName} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Contenu principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-4 bg-white border-b">
            <div className="flex items-center">
              <Link
                to={`/project/${grain?.project_id}`}
                className="flex items-center text-gray-700 hover:text-gray-900 mr-6"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Retour</span>
              </Link>
            </div>
            <div className="flex justify-center items-center">
              <h1 className="text-lg font-semibold">{grain?.title}</h1>{" "}
              <div className="w-12"></div>
              <p className="text-sm text-gray-500">{grain?.project?.title}</p>
            </div>

            <button
              className="flex items-center text-gray-700 hover:text-gray-900"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>Commentaires</span>
            </button>
          </header>

          {/* Contenu (iframe, video ou PDF) */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {grain?.type === "web" || grain?.type === "figma" || grain?.type === "GSlide" ? (
              <iframe
                ref={iframeRef}
                src={grain.url}
                className="w-full h-full border-0"
                title={grain.title}
              />
            ) : grain?.type === "video" ? (
              <VideoPlayer url={grain?.url} onTimeUpdate={handleTimeUpdate} />
            ) : grain?.type === "pdf" ? (
              <PdfViewer url={grain?.url} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Type de contenu non pris en charge</p>
              </div>
            )}
          </div>

          {/* Formulaire de feedback */}
          <div>
            {(user || guest) && grain && (
              <FeedbackForm
                grainId={grain.id}
                projectId={grain.project_id}
                userId={user?.id}
                guestId={guest?.id}
                currentTime={grain.type === "video" ? currentTime : null}
                isVideoType={grain.type === "video"}
                onFeedbackSubmitted={fetchFeedbacks}
              />
            )}
          </div>
        </div>
        {/* Sidebar pour les feedbacks */}
        <aside
          className={`fixed w-72 h-full bg-gray-50 border-l transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          } top-0 bottom-0 z-20 mt-16 md:mt-0`}
          style={{ right: sidebarOpen ? 0 : "-30vw" }}
        >
          <FeedbacksList
            feedbacks={feedbacks}
            onToggleStatus={toggleFeedbackStatus}
            onDeleteFeedback={(id, guestId) => handleDeleteClick(id, guestId)}
            onEditFeedback={handleEditFeedback}
            onClose={() => setSidebarOpen(false)}
            isAuthenticated={!!user}
            currentGuestId={guest?.id || null}
          />
        </aside>
      </div>

      {/* Modals */}
      {isGuestFormOpen && (
        <GuestForm
          projectId={grain?.project_id || ""}
          onClose={() => setIsGuestFormOpen(false)}
          onSubmit={handleGuestSubmit}
        />
      )}

      {feedbackToEdit && (
        <EditCommentModal
          isOpen={!!feedbackToEdit}
          onClose={() => setFeedbackToEdit(null)}
          feedback={feedbackToEdit}
          onSave={handleUpdateFeedback}
        />
      )}

      <DeleteFeedbackDialog
        isOpen={!!feedbackToDelete}
        onClose={() => setFeedbackToDelete(null)}
        onDelete={handleDeleteFeedback}
      />
    </div>
  );
}
