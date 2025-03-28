
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Check, Camera, Video, Play, Pause, Send, X } from "lucide-react";
import html2canvas from "html2canvas";

// Types pour les données
interface Grain {
  id: string;
  title: string;
  type: 'web' | 'video';
  url: string;
  done: boolean;
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
  guest_id: string | null;
  created_at: string;
}

export default function GrainView() {
  const { grainId } = useParams<{ grainId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États
  const [grain, setGrain] = useState<Grain | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Références
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Charger les détails du grain et les feedbacks
  useEffect(() => {
    const fetchGrainDetails = async () => {
      if (!grainId) return;
      
      try {
        setLoading(true);
        
        // Récupérer les détails du grain
        const { data: grainData, error: grainError } = await supabase
          .from('grains')
          .select(`
            *,
            project:project_id (
              title
            )
          `)
          .eq('id', grainId)
          .single();
        
        if (grainError) throw grainError;
        
        setGrain(grainData);
        
        // Récupérer les feedbacks du grain
        const { data: feedbacksData, error: feedbacksError } = await supabase
          .from('feedbacks')
          .select('*')
          .eq('grain_id', grainId)
          .order('created_at', { ascending: false });
        
        if (feedbacksError) throw feedbacksError;
        
        setFeedbacks(feedbacksData || []);
        
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

  // Gérer la lecture/pause de la vidéo
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Mettre à jour le temps actuel de la vidéo
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(Math.floor(videoRef.current.currentTime));
  };
  
  // Prendre une capture d'écran
  const takeScreenshot = async () => {
    try {
      setIsCapturing(true);
      
      let captureElement;
      
      if (grain?.type === 'web' && iframeRef.current) {
        // Capturer l'iframe pour les sites web
        captureElement = iframeRef.current;
      } else if (grain?.type === 'video' && videoRef.current) {
        // Capturer la vidéo
        captureElement = videoRef.current;
      } else {
        throw new Error("Élément non trouvé pour la capture d'écran");
      }
      
      const canvas = await html2canvas(captureElement);
      const dataUrl = canvas.toDataURL('image/png');
      
      setScreenshot(dataUrl);
      toast({
        title: "Capture d'écran prise",
        description: "Vous pouvez maintenant ajouter votre commentaire",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de capture",
        description: error.message || "Impossible de prendre une capture d'écran",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };
  
  // Annuler la capture d'écran
  const cancelScreenshot = () => {
    setScreenshot(null);
  };
  
  // Soumettre un feedback
  const submitFeedback = async () => {
    if (!grain || !newFeedback.trim()) return;
    
    try {
      setSubmitting(true);
      
      // Déterminer le timecode pour les vidéos
      const timecode = grain.type === 'video' ? currentTime : null;
      
      // Uploader la capture d'écran si elle existe
      let screenshotUrl = null;
      if (screenshot) {
        // Convertir la base64 en blob
        const res = await fetch(screenshot);
        const blob = await res.blob();
        
        // Générer un nom de fichier unique
        const fileExt = 'png';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `screenshots/${fileName}`;
        
        // Uploader la capture d'écran
        const { error: uploadError, data } = await supabase.storage
          .from('feedback-screenshots')
          .upload(filePath, blob, {
            contentType: 'image/png',
          });
        
        if (uploadError) throw uploadError;
        
        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('feedback-screenshots')
          .getPublicUrl(filePath);
        
        screenshotUrl = urlData.publicUrl;
      }
      
      // Créer le feedback dans la base de données
      const { data, error } = await supabase
        .from('feedbacks')
        .insert({
          grain_id: grain.id,
          content: newFeedback,
          timecode,
          screenshot_url: screenshotUrl,
          user_id: user?.id,
          done: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      if (data) {
        setFeedbacks(prev => [data, ...prev]);
        setNewFeedback("");
        setScreenshot(null);
        
        toast({
          title: "Feedback ajouté",
          description: "Votre commentaire a été enregistré avec succès",
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le feedback",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Marquer un feedback comme résolu/non résolu
  const toggleFeedbackStatus = async (feedbackId: string, currentStatus: boolean) => {
    try {
      // Mettre à jour le statut dans la base de données
      const { error } = await supabase
        .from('feedbacks')
        .update({ done: !currentStatus })
        .eq('id', feedbackId);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setFeedbacks(prev => 
        prev.map(feedback => 
          feedback.id === feedbackId ? { ...feedback, done: !currentStatus } : feedback
        )
      );
      
      toast({
        title: currentStatus ? "Feedback rouvert" : "Feedback résolu",
        description: currentStatus ? "Le feedback a été marqué comme non résolu" : "Le feedback a été marqué comme résolu",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Formater le timecode pour l'affichage (format mm:ss)
  const formatTimecode = (seconds: number | null) => {
    if (seconds === null) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get user name for NavBar
  const userName = user ? `${user.user_metadata.prenom} ${user.user_metadata.nom}` : "";

  if (loading && !grain) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Chargement...</p>
        </main>
      </div>
    );
  }

  if (!grain) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar userName={userName} />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Élément non trouvé</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux projets
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <NavBar userName={userName} />
      
      <div className="flex-grow flex">
        {/* Zone principale */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${sidebarOpen ? 'pl-0 md:pl-64' : 'pl-0'}`}>
          {/* En-tête avec navigation */}
          <div className="bg-white shadow p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="ml-4">
                <h1 className="text-lg font-semibold">{grain.title}</h1>
                <p className="text-sm text-gray-500">{grain.project?.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={takeScreenshot}
                disabled={isCapturing}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Contenu principal (iframe ou vidéo) */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {grain.type === 'web' ? (
              <iframe 
                ref={iframeRef}
                src={grain.url} 
                className="w-full h-full border-0"
                title={grain.title} 
              />
            ) : (
              <div className="w-full h-full flex flex-col">
                {/* Contrôles vidéo */}
                <div className="bg-gray-800 text-white p-2 flex items-center">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={togglePlayPause}
                    className="text-white"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="ml-2 text-sm">{formatTimecode(currentTime)}</span>
                </div>
                {/* Vidéo */}
                <video 
                  ref={videoRef}
                  src={grain.url} 
                  className="w-full h-full bg-black"
                  controls={false}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Barre latérale (feedbacks) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-full sm:max-w-sm md:max-w-md border-r">
            <div className="h-full flex flex-col">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="flex items-center">
                  <span>Feedbacks</span>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSidebarOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto flex-1 p-4">
                {feedbacks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun feedback pour le moment</p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map(feedback => (
                      <div 
                        key={feedback.id} 
                        className={`p-4 rounded-lg border ${feedback.done ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-500">{formatDate(feedback.created_at)}</span>
                          <Button
                            size="sm"
                            variant={feedback.done ? "outline" : "default"}
                            onClick={() => toggleFeedbackStatus(feedback.id, feedback.done)}
                          >
                            {feedback.done ? "Rouvrir" : <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                        {feedback.timecode !== null && (
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Video className="h-4 w-4 mr-1" />
                            <span>Timecode: {formatTimecode(feedback.timecode)}</span>
                          </div>
                        )}
                        <p className="text-gray-700">{feedback.content}</p>
                        {feedback.screenshot_url && (
                          <div className="mt-2">
                            <img 
                              src={feedback.screenshot_url} 
                              alt="Capture d'écran" 
                              className="rounded-md border max-h-48 w-auto"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t p-4">
                {screenshot && (
                  <div className="mb-4 relative">
                    <img 
                      src={screenshot} 
                      alt="Aperçu" 
                      className="rounded-md border max-h-48 w-auto"
                    />
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="absolute top-2 right-2"
                      onClick={cancelScreenshot}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="flex-1 resize-none"
                    rows={3}
                  />
                  <Button
                    size="sm"
                    disabled={!newFeedback.trim() || submitting}
                    onClick={submitFeedback}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
