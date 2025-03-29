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

  // Références
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

        setGrain(grainData);

        // Récupérer les feedbacks du grain pour l'utilisateur actuel
        if (user) {
          await fetchFeedbacks();
        }
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
  }, [grainId, user, toast]);

  const fetchFeedbacks = async () => {
    if (!grainId || !user) return;

    try {
      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("grain_id", grainId)
        .eq("user_id", user.id)
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
          <div >
            {user && grain && (
              <FeedbackForm
                grainId={grain.id}
                projectId={grain.project_id}
                userId={user.id}
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
