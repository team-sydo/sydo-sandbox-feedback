
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/hooks/useAuth";

export function Layout() {
  const { user } = useAuth();
  const userName = user ? `${user.user_metadata?.prenom || ''} ${user.user_metadata?.nom || ''}`.trim() : '';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <NavBar userName={userName} />
          <SidebarInset>
            <div className="relative">
              <div className="absolute left-4 top-4">
                <SidebarTrigger />
              </div>
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

