import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/NavBar";
import { ProjectCard } from "@/components/ProjectCard";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientCombobox } from "@/components/ClientCombobox";

interface Project {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
  client_id: string | null;
  client_name?: string;
  sites?: number;
  videos?: number;
}

export default function Dashboard() {
  const [clientFilter, setClientFilter] = useState("");
  const [activeTab, setActiveTab] = useState("tous");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ 
    title: "", 
    description: "",
    client_id: null as string | null,
    client_name: ""
  });
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients:client_id (
            id,
            nom
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const projectsWithCounts = data.map(project => ({
        ...project,
        client_name: project.clients ? project.clients.nom : null,
        sites: Math.floor(Math.random() * 5) + 1,
        videos: Math.floor(Math.random() * 3)
      }));
      
      setProjects(projectsWithCounts);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les projets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientName: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          nom: clientName,
          user_id: user?.id
        })
        .select();

      if (error) throw error;
      
      return data[0].id;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le client: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const createProject = async () => {
    if (!newProject.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre du projet est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      let clientId = newProject.client_id;

      if (!clientId && newProject.client_name) {
        clientId = await createClient(newProject.client_name);
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: newProject.title,
          description: newProject.description || null,
          user_id: user?.id,
          client_id: clientId,
          created_by: user?.id
        })
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Projet créé avec succès",
      });

      setIsDialogOpen(false);
      setNewProject({ title: "", description: "", client_id: null, client_name: "" });
      
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le projet",
        variant: "destructive",
      });
    }
  };

  const handleClientSelect = (clientId: string | null, clientName: string) => {
    setNewProject(prev => ({
      ...prev,
      client_id: clientId,
      client_name: clientName
    }));
  };

  const filteredProjects = projects.filter((project) => {
    if (activeTab === "actifs" && !project.active) return false;
    if (activeTab === "archives" && project.active) return false;
    
    if (clientFilter && !project.title.toLowerCase().includes(clientFilter.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const userName = user ? `${user.user_metadata.prenom} ${user.user_metadata.nom}` : "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar userName={userName} />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Projets</h1>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-5 w-5 mr-2" /> Nouveau projet
          </Button>
        </div>
        
        <Tabs 
          defaultValue="tous" 
          className="mb-8"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="tous">Tous</TabsTrigger>
            <TabsTrigger value="actifs">Actifs</TabsTrigger>
            <TabsTrigger value="archives">Archivés</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <label htmlFor="client-filter" className="font-medium text-lg">
              Client :
            </label>
            <Input
              id="client-filter"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="max-w-xs"
              placeholder="Filtrer par client"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des projets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  client={project.client_name || project.description || ""}
                  sites={project.sites || 0}
                  videos={project.videos || 0}
                  status={project.active ? "actif" : "archivé"}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Aucun projet ne correspond à vos critères.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau projet</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau projet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <ClientCombobox onClientSelect={handleClientSelect} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-title">Titre du projet</Label>
              <Input
                id="project-title"
                value={newProject.title}
                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Mon nouveau projet"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (facultatif)</Label>
              <Textarea
                id="project-description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du projet"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createProject} className="bg-blue-500 hover:bg-blue-600">
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
