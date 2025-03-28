
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SydoLogo } from "@/components/SydoLogo";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation de connexion réussie
    if (email && password) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Sydo Reviews",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Erreur de connexion",
        description: "Veuillez vérifier vos informations",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'inscription réussie
    if (email && password && firstName && lastName) {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Erreur d'inscription",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="mb-10">
        <SydoLogo />
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        <Tabs defaultValue="connexion" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="connexion">Connexion</TabsTrigger>
            <TabsTrigger value="inscription">Inscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connexion">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                Se connecter
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="inscription">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium">
                    Prénom
                  </label>
                  <Input
                    id="firstName"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium">
                    Nom
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email-signup" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password-signup" className="block text-sm font-medium">
                  Mot de passe
                </label>
                <Input
                  id="password-signup"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                S'inscrire
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
