import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NavBar } from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Filter, Check, Image } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserData {
  nom: string;
  prenom: string;
}

interface Feedback {
  id: string;
  content: string;
  created_at: string;
  done: boolean;
  grain_id: string;
  guest_id: string | null;
  screenshot_url: string | null;
  timecode: number | null;
  user_id: string | null;
  guest?: UserData | null;
  user?: UserData | null;
  grain?: {
    title: string;
  } | null;
}

interface Grain {
  id: string;
  title: string;
}

export default function CommentsList() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState("");
  const [grains, setGrains] = useState<Grain[]>([]);
  const [selectedGrainId, setSelectedGrainId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "pending">(
    "all"
  );

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      try {
        setLoading(true);

        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("title")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        if (projectData) setProjectTitle(projectData.title);

        const { data: grainsData, error: grainsError } = await supabase
          .from("grains")
          .select("id, title")
          .eq("project_id", projectId)
          .order("title");

        if (grainsError) throw grainsError;
        if (grainsData) setGrains(grainsData);

        await fetchFeedbacks();
      } catch (error: any) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du projet",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, toast]);

  const fetchFeedbacks = async () => {
    if (!projectId) return;

    try {
      // Use project_id directly instead of grain.project_id
      let query = supabase
        .from("feedbacks")
        .select(
          `
          *,
          grain:grain_id(title)
        `
        )
        .eq("project_id", projectId);

      if (selectedGrainId) {
        query = query.eq("grain_id", selectedGrainId);
      }

      if (statusFilter === "done") {
        query = query.eq("done", true);
      } else if (statusFilter === "pending") {
        query = query.eq("done", false);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      if (data) {
        // Create a separate function to get user and guest data when needed
        const processedFeedbacks: Feedback[] = data.map((item) => {
          return {
            ...item,
            user: null, // We'll handle user data separately if needed
            guest: null, // We'll handle guest data separately if needed
            grain:
              typeof item.grain === "object" && item.grain !== null
                ? item.grain
                : null,
          };
        });

        // For feedbacks with user_id or guest_id, fetch their information separately
        for (let i = 0; i < processedFeedbacks.length; i++) {
          const feedback = processedFeedbacks[i];

          if (feedback.user_id) {
            const { data: userData } = await supabase
              .from("users")
              .select("nom, prenom")
              .eq("id", feedback.user_id)
              .single();

            if (userData) {
              processedFeedbacks[i].user = userData as UserData;
            }
          }

          if (feedback.guest_id) {
            const { data: guestData } = await supabase
              .from("guests")
              .select("nom, prenom")
              .eq("id", feedback.guest_id)
              .single();

            if (guestData) {
              processedFeedbacks[i].guest = guestData as UserData;
            }
          }
        }

        setFeedbacks(processedFeedbacks);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des feedbacks:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [selectedGrainId, statusFilter, projectId]);

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

      setFeedbacks(
        feedbacks.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, done: !currentStatus }
            : feedback
        )
      );

      toast({
        title: "Succès",
        description: currentStatus
          ? "Le commentaire a été marqué comme non traité"
          : "Le commentaire a été marqué comme traité",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du commentaire",
        variant: "destructive",
      });
    }
  };

  const formatTimecode = (seconds: number | null) => {
    if (seconds === null) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getCommenterName = (feedback: Feedback) => {
    if (feedback.user && feedback.user.prenom && feedback.user.nom) {
      return `${feedback.user.prenom} ${feedback.user.nom} (User)`;
    } else if (feedback.guest && feedback.guest.prenom && feedback.guest.nom) {
      return `${feedback.guest.prenom} ${feedback.guest.nom} (Guest)`;
    }
    return "Anonyme";
  };

  const getGrainTitle = (feedback: Feedback) => {
    return feedback.grain?.title || "Inconnu";
  };

  const userName = user
    ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
    : "";

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
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="w-full sm:w-64">
                <Select
                  value={selectedGrainId || "all"}
                  onValueChange={(value) =>
                    setSelectedGrainId(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par grain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les grains</SelectItem>
                    {grains.map((grain) => (
                      <SelectItem key={grain.id} value={grain.id}>
                        {grain.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-64">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as "all" | "done" | "pending")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="done">Traités</SelectItem>
                    <SelectItem value="pending">Non traités</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" onClick={() => fetchFeedbacks()}>
              <Filter className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nom du commentateur</TableHead>
                    <TableHead>Grain</TableHead>
                    <TableHead>Commentaire</TableHead>
                    <TableHead>Capture</TableHead>
                    <TableHead>Time Code</TableHead>
                    <TableHead>Traité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback, index) => (
                    <TableRow key={feedback.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{getCommenterName(feedback)}</TableCell>
                      <TableCell>{getGrainTitle(feedback)}</TableCell>
                      <TableCell>{feedback.content}</TableCell>
                      <TableCell>
                        {feedback.screenshot_url ? (
                          <a
                            href={feedback.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:underline"
                          >
                            <img
                              src={feedback.screenshot_url}
                              alt="Capture"
                              className="max-w-24 max-h-24"
                            />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {feedback.timecode !== null
                          ? formatTimecode(feedback.timecode)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={feedback.done}
                          onCheckedChange={() =>
                            toggleFeedbackStatus(feedback.id, feedback.done)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
