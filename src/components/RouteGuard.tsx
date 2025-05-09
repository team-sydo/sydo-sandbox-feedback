
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}

export function PublicRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // For /auth, redirect to home if already logged in
  if (window.location.pathname === '/auth' && user) {
    return <Navigate to="/home" replace />;
  }
  
  // For all other public routes, allow access regardless of authentication status
  return <Outlet />;
}
