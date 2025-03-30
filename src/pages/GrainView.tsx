
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

// Types
interface Grain {
  id: string;
  title: string;
  type: "web" | "video";
  url: string;
  project_id: string;
  project?: {
    title: string;
  };
}

interface Feedback {
  id: string;
  grain_id: string;
  content: string;
  timecode: number | null;
  screenshot_url: string | null;
  done: boolean;
  user_id: string | null;
  created_at: string;
}

interface Guest {
  id: string;
  prenom: string;
  nom: string;
  device: string;
  navigateur: string;
  project_id: string;
}

export default function GrainView() {
  const { grainId } = useParams<{ grainId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  // États
  const [grain, setGrain] = useState<Grain | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);

  // Références
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check for guest in localStorage
  useEffect(() => {
    const storedGuest = localStorage.getItem('guest');
    if (storedGuest) {
      try {
        setGuest(JSON.parse(storedGuest));
      } catch (err) {
        console.error("Error parsing guest from localStorage:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchGrainDetails = async () => {
      if (!grainId) return;

      try {
        setLoading(true);
        setError(null);

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
          .maybeSingle();

        if (grainError) throw grainError;

        if (!grainData) {
          setError("Élément de test non trouvé");
          setGrain(null);
        } else {
          setGrain(grainData);
        }

        // Récupérer les feedbacks du grain
        await fetchFeedbacks();
      } catch (error: any) {
        console.error("Error fetching grain details:", error);
        setError(error.message || "Une erreur s'est produite");
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

  const fetchFeedbacks = async () => {
    if (!grainId) return;

    try {
      // Fetch feedbacks based on user authentication status
      let query = supabase
        .from("feedbacks")
        .select("*")
        .eq("grain_id", grainId);

      if (user) {
        // If user is authenticated, fetch their feedbacks
        query = query.eq("user_id", user.id);
      } else if (guest) {
        // If guest info is available, fetch their feedbacks
        query = query.eq("guest_id", guest.id);
      } else {
        // If neither user nor guest, return empty array
        setFeedbacks([]);
        return;
      }

      const { data: feedbacksData, error: feedbacksError } = await query
        .order("created_at", { ascending: false });

      if (feedbacksError) throw feedbacksError;

      setFeedbacks(feedbacksData || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des feedbacks:", error);
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

  // Get user name for NavBar
  const userName = user
    ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
    : guest
    ? `${guest.prenom} ${guest.nom} (Invité)`
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

  if (!grain || error) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} />
        <main className="flex-1 flex items-center justify-center flex-col">
          <p className="text-gray-500 mb-4">Élément non trouvé</p>
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 bg-white px-4 py-2 rounded border"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à l'accueil
          </Link>
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

          {/* Contenu (iframe ou video) */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {grain?.type === "web" ? (
              <iframe
                ref={iframeRef}
                src={grain.url}
                className="w-full h-full border-0"
                title={grain.title}
              />
            ) : (
              <VideoPlayer url={grain?.url} onTimeUpdate={handleTimeUpdate} />
            )}
          </div>
          
          {/* Formulaire de feedback */}
          <div>
            {grain && (
              <FeedbackForm
                grainId={grain.id}
                projectId={grain.project_id}
                userId={user?.id}
                guestId={!user ? guest?.id : undefined}
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
            onClose={() => setSidebarOpen(false)}
          />
        </aside>
      </div>
    </div>
  );
}
