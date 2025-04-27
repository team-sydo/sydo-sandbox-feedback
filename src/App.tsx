
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute, PublicRoute } from './components/RouteGuard';
import { Layout } from './components/Layout';
import { 
  Auth, 
  Dashboard, 
  ReturnsView,
  Home, 
  NotFound, 
  ProjectView, 
  GrainView, 
  CommentsList, 
  TasksPage 
} from './pages';
import Index from './pages/Index';
import { SidebarProvider } from './components/ui/sidebar';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              {/* Wrapping Index page with SidebarProvider */}
              <Route path="/" element={
                <SidebarProvider>
                  <Index />
                </SidebarProvider>
              } />
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
                <Route path="/returns" element={<ReturnsView />} />
                <Route path="/tasks" element={<TasksPage />} />
              </Route>
            </Route>
            
            {/* Redirect /dashboard to /home when authenticated */}
            <Route
              path="/home"
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
