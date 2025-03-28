
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  X, 
  Image, 
  Video, 
  Play, 
  Pause, 
  Send, 
  Check,
  ExternalLink,
  Menu
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";

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
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Références
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        
        // Récupérer les feedbacks du grain pour l'utilisateur actuel
        if (user) {
          const { data: feedbacksData, error: feedbacksError } = await supabase
            .from('feedbacks')
            .select('*')
            .eq('grain_id', grainId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (feedbacksError) throw feedbacksError;
          
          setFeedbacks(feedbacksData || []);
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
  
  // Gérer la sélection de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner un fichier image",
          variant: "destructive",
        });
        return;
      }
      
      setScreenshotFile(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Image sélectionnée",
        description: "Votre capture a été ajoutée",
      });
    }
  };
  
  // Annuler la capture d'écran
  const cancelScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Soumettre un feedback
  const submitFeedback = async () => {
    if (!grain || !newFeedback.trim() || !user) return;
    
    try {
      setSubmitting(true);
      
      // Déterminer le timecode pour les vidéos
      const timecode = grain.type === 'video' ? currentTime : null;
      
      // Uploader la capture d'écran si elle existe
      let screenshotUrl = null;
      if (screenshotFile) {
        // Générer un nom de fichier unique
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        // Uploader la capture d'écran
        const { error: uploadError, data } = await supabase.storage
          .from('feedback-screenshots')
          .upload(filePath, screenshotFile, {
            contentType: screenshotFile.type,
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
          project_id: grain.project_id,
          content: newFeedback,
          timecode,
          screenshot_url: screenshotUrl,
          user_id: user.id,
          done: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      if (data) {
        setFeedbacks(prev => [data, ...prev]);
        setNewFeedback("");
        setScreenshotFile(null);
        setScreenshotPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
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
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour au dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userName={userName} />
      
      <div className="flex flex-1">
        {/* Sidebar pour les feedbacks (visible sur mobile uniquement quand ouverte) */}
        <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <DrawerContent className="h-[85vh] max-h-[85vh] rounded-t-xl">
            <DrawerHeader className="border-b">
              <div className="flex items-center justify-between">
                <DrawerTitle>Mes commentaires</DrawerTitle>
                <DrawerClose>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="overflow-auto p-4 h-full">
              {feedbacks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucun commentaire pour le moment</p>
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
          </DrawerContent>
        </Drawer>
        
        {/* Barre latérale (visible uniquement sur desktop) */}
        <div className={`hidden md:flex flex-col w-64 border-r bg-white transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Mes commentaires</h2>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-auto p-4 flex-1">
            {feedbacks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun commentaire pour le moment</p>
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
        </div>
        
        {/* Contenu principal */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          {/* En-tête */}
          <div className="bg-white shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au dashboard
                </Link>
              </Button>
              <div className="mx-4">
                <h1 className="text-lg font-semibold">{grain.title}</h1>
                <p className="text-sm text-gray-500">{grain.project?.title || 'Projet'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                <Menu className="h-4 w-4 mr-2" />
                Commentaires
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex"
              >
                {sidebarOpen ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Fermer
                  </>
                ) : (
                  <>
                    <Menu className="h-4 w-4 mr-2" />
                    Commentaires
                  </>
                )}
              </Button>
              {grain.url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="hidden md:flex"
                >
                  <a href={grain.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir dans un nouvel onglet
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          {/* Contenu (iframe ou vidéo) */}
          <div className="flex-1 bg-gray-100">
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
          
          {/* Zone de saisie de commentaire */}
          <div className="bg-white border-t p-4">
            <div className="container mx-auto max-w-4xl">
              <div className="mb-4">
                {screenshotPreview && (
                  <div className="relative inline-block mb-2">
                    <img 
                      src={screenshotPreview} 
                      alt="Aperçu" 
                      className="h-24 rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={cancelScreenshot}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <div className="hidden md:block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    id="screenshot-input"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                </div>
                
                <div className="flex-1">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    disabled={!newFeedback.trim() || submitting}
                    onClick={submitFeedback}
                    className="h-full"
                  >
                    <Send className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Envoyer</span>
                  </Button>
                  
                  <div className="md:hidden">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      id="screenshot-input-mobile"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
