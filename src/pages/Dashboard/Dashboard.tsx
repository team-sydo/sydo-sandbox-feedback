
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/NavBar";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProjectsList } from "./components/ProjectsList";
import { useProjects } from "./hooks/useProjects";
import { NewProjectDialog } from "./components/NewProjectDialog";

export default function Dashboard() {
  const [clientFilter, setClientFilter] = useState("");
  const [activeTab, setActiveTab] = useState("tous");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { projects, loading, fetchProjects } = useProjects();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleProjectCreated = () => {
    setIsDialogOpen(false);
    fetchProjects();
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
        
        <ProjectsList 
          projects={filteredProjects} 
          loading={loading} 
        />
      </main>

      <NewProjectDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
