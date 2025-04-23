
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SydoLogo } from '@/components/SydoLogo';

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <SydoLogo className="h-16 w-auto" />
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sydo Reviews</h1>
          <p className="text-gray-600 mb-6">
            Plateforme de feedback pour vos projets web et vidéo
          </p>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : user ? (
            <Button asChild className="w-full">
              <Link to="/home">
                Accéder à mon dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to="/auth">
                Se connecter
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Sydo. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Index;
