
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, User } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { useLocation } from "react-router-dom";

interface GuestFormProps {
  projectId?: string;
  onClose: () => void;
  onSubmit: (guest: any) => void;
}

interface Guest {
  id: string;
  prenom: string;
  nom: string;
  poste?: string | null;
}

export function GuestForm({ projectId = '', onClose, onSubmit }: GuestFormProps) {
  const location = useLocation();
  const [currentProjectId, setCurrentProjectId] = useState(projectId);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [device, setDevice] = useState<'mobile' | 'ordinateur' | 'tablette'>('ordinateur');
  const [browser, setBrowser] = useState<'chrome' | 'edge' | 'firefox' | 'safari' | 'autre'>('chrome');
  const [loading, setLoading] = useState(false);
  const [existingGuests, setExistingGuests] = useState<Guest[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'existing'>('new');
  const [accessMode, setAccessMode] = useState<'guest' | 'user'>('guest');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentProjectId) {
      const pathSegments = location.pathname.split('/');
      const potentialProjectId = pathSegments.find((segment, index) => 
        pathSegments[index - 1] === 'project' && segment
      );
      
      if (potentialProjectId) {
        setCurrentProjectId(potentialProjectId);
      }
    }
  }, [location, currentProjectId]);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        if (!currentProjectId) {
          console.log("No valid projectId available, skipping guest fetch");
          return;
        }
        
        console.log("Fetching guests for project:", currentProjectId);
        const { data, error } = await supabase
          .from('guests')
          .select('id, prenom, nom, poste')
          .eq('project_id', currentProjectId);

        if (error) {
          console.error("Error fetching guests:", error);
          throw error;
        }

        console.log("Fetched guests:", data);
        if (data && data.length > 0) {
          setExistingGuests(data);
          // Ne changeons plus automatiquement le mode pour éviter le bug
          // if (formMode === 'new' && data.length > 0) {
          //   setFormMode('existing');
          // }
        }
      } catch (error) {
        console.error("Error in fetchGuests:", error);
      }
    };

    if (currentProjectId) {
      fetchGuests();
    }
  }, [currentProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      console.log("Form mode:", formMode);
      console.log("Selected guest ID:", selectedGuestId);

      if (formMode === 'existing' && selectedGuestId) {
        const selectedGuest = existingGuests.find(guest => guest.id === selectedGuestId);
        console.log("Selected existing guest:", selectedGuest);
        
        if (selectedGuest) {
          onSubmit(selectedGuest);
          onClose();
          return;
        }
      }

      if (formMode === 'new' || !selectedGuestId) {
        if (!firstName.trim() || !lastName.trim()) {
          toast({
            title: "Erreur",
            description: "Le prénom et le nom sont requis",
            variant: "destructive",
          });
          return;
        }

        const guestData = {
          prenom: firstName,
          nom: lastName,
          poste: position || null,
          device,
          navigateur: browser,
          project_id: currentProjectId
        };

        console.log("Creating new guest with data:", guestData);

        const { data, error } = await supabase
          .from('guests')
          .insert([guestData])
          .select();

        if (error) {
          console.error("Error creating guest:", error);
          throw error;
        }

        console.log("Created guest:", data);
        
        if (data && data.length > 0) {
          onSubmit(data[0]);
          toast({
            title: "Succès",
            description: "Votre profil a été enregistré",
          });
          onClose();
        } else {
          throw new Error("No data returned from insert operation");
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la création de l'invité:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSelect = (guestId: string) => {
    console.log("Selected guest with ID:", guestId);
    setSelectedGuestId(guestId);
    
    const selectedGuest = existingGuests.find(guest => guest.id === guestId);
    if (selectedGuest) {
      setFirstName(selectedGuest.prenom);
      setLastName(selectedGuest.nom);
      setPosition(selectedGuest.poste || "");
    }
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const handleModeChange = (mode: 'new' | 'existing') => {
    console.log("Changing form mode to:", mode);
    setFormMode(mode);
    
    // Réinitialiser les champs si on change pour le mode 'new'
    if (mode === 'new') {
      setFirstName("");
      setLastName("");
      setPosition("");
      setSelectedGuestId(null);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bienvenue sur Sydo Reviews</DialogTitle>
          <DialogDescription>
            Choisissez un mode d'accès pour consulter les éléments à tester.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4 flex items-center gap-4">
          <Button 
            variant={accessMode === 'guest' ? "default" : "outline"} 
            size="sm"
            onClick={() => setAccessMode('guest')}
            className="flex-1"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Accès invité
          </Button>
          <Button 
            variant={accessMode === 'user' ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setAccessMode('user');
              setIsLoginModalOpen(true);
            }}
            className="flex-1"
          >
            <User className="mr-2 h-4 w-4" />
            Connexion utilisateur
          </Button>
        </div>

        {accessMode === 'guest' && (
          <>
            {existingGuests.length > 0 && (
              <div className="mb-4 flex items-center gap-4">
                <Button 
                  variant={formMode === 'existing' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleModeChange('existing')}
                  className="flex-1"
                >
                  Profil existant
                </Button>
                <Button 
                  variant={formMode === 'new' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleModeChange('new')}
                  className="flex-1"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nouveau profil
                </Button>
              </div>
            )}

            {formMode === 'existing' && existingGuests.length > 0 && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="existingGuest">Sélectionner un profil</Label>
                <Select
                  value={selectedGuestId || ""}
                  onValueChange={handleGuestSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir un profil" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingGuests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.prenom} {guest.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {(formMode === 'new' || existingGuests.length === 0) && (
                <>
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
                </>
              )}
              
              <DialogFooter className="pt-4">
                <Button 
                  type="submit"
                  disabled={loading || (formMode === 'existing' && !selectedGuestId)}
                  className="w-full"
                >
                  {loading ? "Traitement..." : "Commencer le test"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>

      {isLoginModalOpen && (
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => {
            handleLoginModalClose();
            onClose(); // Fermer également la boîte de dialogue principale
          }}
        />
      )}
    </Dialog>
  );
}
