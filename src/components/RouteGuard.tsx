
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    // Show a loading state while checking authentication
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
    // Show a loading state while checking authentication
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // Allow access to the home page even when logged in
  if (window.location.pathname === '/') {
    return <Outlet />;
  }
  
  // For other public routes like /auth, redirect to dashboard if already logged in
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
