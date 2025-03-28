
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/NavBar";
import { ProjectCard } from "@/components/ProjectCard";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Données fictives pour les projets
const mockProjects = [
  { id: 1, title: "Mon premier projet", client: "Nom du client", sites: 1, videos: 1, status: "actif" as const },
  { id: 2, title: "Mon premier projet", client: "Nom du client", sites: 1, videos: 1, status: "actif" as const },
  { id: 3, title: "Mon premier projet", client: "Nom du client", sites: 1, videos: 1, status: "actif" as const },
  { id: 4, title: "Projet archivé", client: "Ancien client", sites: 2, videos: 0, status: "archivé" as const },
];

export default function Dashboard() {
  const [clientFilter, setClientFilter] = useState("");
  const [activeTab, setActiveTab] = useState("tous");
  const { toast } = useToast();
  
  // Filtrage des projets en fonction de l'onglet actif et du filtre client
  const filteredProjects = mockProjects.filter((project) => {
    // Filtre par statut
    if (activeTab === "actifs" && project.status !== "actif") return false;
    if (activeTab === "archives" && project.status !== "archivé") return false;
    
    // Filtre par client
    if (clientFilter && !project.client.toLowerCase().includes(clientFilter.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleNewProject = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La création de nouveaux projets sera disponible prochainement",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar userName="Prénom du User" />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Projets</h1>
          <Button 
            onClick={handleNewProject}
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                client={project.client}
                sites={project.sites}
                videos={project.videos}
                status={project.status}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Aucun projet ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
