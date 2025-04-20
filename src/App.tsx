
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute, PublicRoute } from './components/RouteGuard';
import { Layout } from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import ProjectView from './pages/ProjectView';
import GrainView from './pages/GrainView';
import CommentsList from './pages/CommentsList';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/project/:projectId" element={<ProjectView />} />
              <Route path="/project/:projectId/comments" element={<CommentsList />} />
              <Route path="/grain/:grainId" element={<GrainView />} />
            </Route>
            
            {/* Protected routes with Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Route>
            
            {/* Redirect /dashboard to /home when authenticated */}
            <Route
              path="/dashboard"
              element={<Navigate to="/home" replace />}
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
