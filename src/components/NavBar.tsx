
import { useState } from "react";
import { SydoLogo } from "./SydoLogo";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Guest } from "@/components/guest/GuestSelectionModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface NavBarProps {
  userName: string;
  isProjectPage?: boolean;
  onGuestPrompt?: () => void;
  guestData?: Guest | null;
}

export function NavBar({ userName, isProjectPage = false, onGuestPrompt, guestData }: NavBarProps) {
  const { user, signIn, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    signOut();
    // Si nous sommes sur une page de projet, afficher la modal d'invité après déconnexion
    if (isProjectPage && onGuestPrompt) {
      // Ajout d'un petit délai pour que la déconnexion soit traitée avant d'afficher la modal
      setTimeout(() => {
        onGuestPrompt();
      }, 100);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="border-b py-4 px-6 flex justify-between items-center bg-white">
        <SydoLogo />
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            {user ? userName : guestData ? `${guestData.prenom} ${guestData.nom} (Invité)` : ""}
          </div>
          {user ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : isProjectPage ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowLoginModal(true)}
              title="Connexion"
            >
              <LogIn className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </nav>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion</DialogTitle>
            <DialogDescription>
              Connectez-vous pour accéder à toutes les fonctionnalités.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
