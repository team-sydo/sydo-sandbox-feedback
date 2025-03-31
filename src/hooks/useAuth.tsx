
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Type pour le guest
export interface Guest {
  id: string;
  prenom: string;
  nom: string;
  poste: string | null;
  device?: "mobile" | "ordinateur" | "tablette";
  navigateur?: "chrome" | "edge" | "firefox" | "safari" | "autre";
  project_id: string;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  guest: Guest | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setGuestData: (guestData: Guest) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const currentPath = location.pathname;

  // Fonction pour définir les données du guest
  const setGuestData = (guestData: Guest) => {
    setGuest(guestData);
    // Optionnellement, on peut stocker ces données dans le localStorage pour les conserver entre les sessions
    localStorage.setItem('guestData', JSON.stringify(guestData));
  };

  // Effet pour récupérer les données du guest depuis le localStorage au chargement
  useEffect(() => {
    const storedGuestData = localStorage.getItem('guestData');
    if (storedGuestData) {
      try {
        setGuest(JSON.parse(storedGuestData));
      } catch (error) {
        console.error("Error parsing stored guest data:", error);
        localStorage.removeItem('guestData');
      }
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && location.pathname === '/auth') {
          // Only redirect if we're on the auth page
          setTimeout(() => {
            navigate('/dashboard');
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Only redirect to auth page if NOT on a project view page, grain view page, comments list page or home page
          if (!currentPath.startsWith('/project/') && 
              !currentPath.startsWith('/grain/') && 
              !currentPath.includes('/comments') && 
              currentPath !== '/') {
            setTimeout(() => {
              navigate('/auth');
            }, 0);
          }
          // No redirection for public pages - user stays on the same page
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Don't redirect if we already have a session and are on a valid route
      // or if we're on a public page (which is accessible without auth)
      if (!session && 
          !currentPath.startsWith('/project/') && 
          !currentPath.startsWith('/grain/') && 
          !currentPath.includes('/comments') && 
          currentPath !== '/' && 
          currentPath !== '/auth') {
        // Only redirect to auth if not on home, auth, or public pages
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, currentPath]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Sydo Reviews",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Veuillez vérifier vos informations",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            prenom: firstName,
            nom: lastName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Veuillez vérifier vos informations",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Nettoyer également les données du guest lorsqu'un utilisateur se déconnecte
      setGuest(null);
      localStorage.removeItem('guestData');
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        guest,
        signIn,
        signUp,
        signOut,
        setGuestData,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
