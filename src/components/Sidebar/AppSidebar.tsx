import { useState } from "react";
import { SydoLogo } from "../SydoLogo";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GuestForm } from "../GuestForm";
import { Home, LayoutDashboard } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface NavBarProps {
  userName: string;
}

const navigationItems = [
  {
    title: "Accueil",
    icon: Home,
    path: "/home",
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Tâches",
    icon: LayoutDashboard, // Choisis un icône plus adapté si tu veux, ex: CheckSquare
    path: "/tasks",
  },
];

export function AppSidebar({ userName }: NavBarProps) {
  const location = useLocation();
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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SydoLogo />
          <SidebarGroupLabel>{userName && <div className="text-sm font-medium">{userName}</div>}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          
        </SidebarGroup>
      </SidebarContent>
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
      {isGuestFormOpen && (
        <GuestForm
          projectId="" // Nous devons passer un projectId, même vide pour le moment
          onClose={() => setIsGuestFormOpen(false)}
          onSubmit={handleGuestSubmit}
        />
      )}
    </Sidebar>
  );
}
