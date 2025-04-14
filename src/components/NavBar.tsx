
import { useState } from "react";
import { SydoLogo } from "./SydoLogo";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GuestForm } from "./GuestForm";

interface NavBarProps {
  userName: string;
}

export function NavBar({ userName }: NavBarProps) {
  const { signOut, user } = useAuth();
  const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAuthAction = async () => {
    if (user) {
      try {
        setIsLoggingOut(true);
        await signOut();
      } catch (error) {
        console.error("Error during logout:", error);
      } finally {
        setIsLoggingOut(false);
      }
    } else {
      setIsGuestFormOpen(true);
    }
  };

  // Fonction pour gérer la soumission d'un invité
  const handleGuestSubmit = (guest: any) => {
    setIsGuestFormOpen(false);
    // Vous pourriez ajouter ici une logique supplémentaire si nécessaire
  };

  return (
    <nav className="border-b py-4 px-6 flex justify-between items-center bg-white">
      <SydoLogo />
      <div className="flex items-center gap-4">
        {userName && (
          <div className="text-sm font-medium">
            {userName}
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleAuthAction}
          disabled={isLoggingOut}
          className="flex items-center gap-2"
          title={user ? "Déconnexion" : "Connexion"}
        >
          {user ? (
            <>
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Connexion</span>
            </>
          )}
        </Button>
      </div>
      
      {isGuestFormOpen && (
        <GuestForm 
          projectId="" // Nous devons passer un projectId, même vide pour le moment
          onClose={() => setIsGuestFormOpen(false)} 
          onSubmit={handleGuestSubmit} 
        />
      )}
    </nav>
  );
}
