
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Guest {
  id: string;
  prenom: string;
  nom: string;
  poste: string | null;
  device: 'mobile' | 'ordinateur' | 'tablette';
  navigateur: 'chrome' | 'edge' | 'firefox' | 'safari' | 'autre';
  project_id: string;
}

interface GuestSelectionModalProps {
  projectId: string;
  onClose: () => void;
  onGuestSelected: (guest: Guest) => void;
}

export function GuestSelectionModal({ projectId, onClose, onGuestSelected }: GuestSelectionModalProps) {
  const [existingGuests, setExistingGuests] = useState<Guest[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("select");

  // New guest form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [device, setDevice] = useState<'mobile' | 'ordinateur' | 'tablette'>('ordinateur');
  const [browser, setBrowser] = useState<'chrome' | 'edge' | 'firefox' | 'safari' | 'autre'>('chrome');
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch existing guests for this project
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .eq('project_id', projectId);

        if (error) throw error;
        setExistingGuests(data || []);
        
        // If there are no existing guests, default to create tab
        if (!data || data.length === 0) {
          setActiveTab("create");
        }
      } catch (error) {
        console.error("Error fetching guests:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des invités",
          variant: "destructive",
        });
      }
    };

    fetchGuests();
  }, [projectId, toast]);

  const handleSelectGuest = () => {
    if (!selectedGuestId) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un invité dans la liste",
        variant: "destructive",
      });
      return;
    }

    const selectedGuest = existingGuests.find(guest => guest.id === selectedGuestId);
    if (selectedGuest) {
      onGuestSelected(selectedGuest);
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Erreur",
        description: "Le prénom et le nom sont requis",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const guestData = {
        prenom: firstName,
        nom: lastName,
        poste: position || null,
        device,
        navigateur: browser,
        project_id: projectId
      };

      const { data, error } = await supabase
        .from('guests')
        .insert(guestData)
        .select()
        .single();

      if (error) throw error;

      onGuestSelected(data);
      
      toast({
        title: "Succès",
        description: "Votre profil invité a été créé",
      });
    } catch (error: any) {
      console.error("Erreur lors de la création de l'invité:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le profil invité",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bienvenue sur Sydo Reviews</DialogTitle>
          <DialogDescription>
            Veuillez vous identifier pour continuer à consulter ce projet
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {existingGuests.length > 0 && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Sélectionner un profil</TabsTrigger>
              <TabsTrigger value="create">Créer un profil</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="select" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guest-select">Choisissez votre profil</Label>
              <Select 
                value={selectedGuestId} 
                onValueChange={setSelectedGuestId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un profil" />
                </SelectTrigger>
                <SelectContent>
                  {existingGuests.map(guest => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.prenom} {guest.nom} {guest.poste ? `(${guest.poste})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                onClick={handleSelectGuest}
                disabled={!selectedGuestId}
                className="w-full"
              >
                Continuer
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="create">
            <form onSubmit={handleCreateGuest} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Poste (optionnel)</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Directeur marketing"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="device">Sur quel appareil êtes-vous ?</Label>
                <RadioGroup
                  value={device}
                  onValueChange={(value) => setDevice(value as 'mobile' | 'ordinateur' | 'tablette')}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile">Mobile</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ordinateur" id="ordinateur" />
                    <Label htmlFor="ordinateur">Ordinateur</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tablette" id="tablette" />
                    <Label htmlFor="tablette">Tablette</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="browser">Quel navigateur utilisez-vous ?</Label>
                <Select 
                  value={browser} 
                  onValueChange={(value) => setBrowser(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un navigateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chrome">Chrome</SelectItem>
                    <SelectItem value="edge">Edge</SelectItem>
                    <SelectItem value="firefox">Firefox</SelectItem>
                    <SelectItem value="safari">Safari</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter className="pt-4">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Traitement..." : "Créer mon profil et continuer"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
