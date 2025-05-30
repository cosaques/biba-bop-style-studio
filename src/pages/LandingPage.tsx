
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const handleGetStarted = () => {
    navigate('/register/client');
  };

  const handleMonCompte = () => {
    if (profile?.role === 'consultant') {
      navigate('/consultant/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Biba-Bop Logo"
            className="h-10 mr-2"
          />
        </div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <Button onClick={handleMonCompte} variant="outline">
              Mon Compte
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline">Connexion</Button>
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-bibabop-navy mb-6">
          Révélez votre style avec Biba-Bop
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Découvrez un service de conseil en image personnalisé qui transforme votre garde-robe et révèle votre style unique.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-bibabop-coral hover:bg-bibabop-coral/90 text-white px-8 py-3"
          >
            Commencer maintenant
          </Button>
          <Link to="/register/consultant">
            <Button variant="outline" size="lg" className="px-8 py-3">
              Devenir conseiller
            </Button>
          </Link>
        </div>

        {/* Video Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative bg-gray-200 rounded-lg overflow-hidden shadow-lg aspect-video">
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
              </div>
            )}
            <video
              className="w-full h-full object-cover"
              controls
              onLoadedData={() => setIsVideoLoading(false)}
              poster="/placeholder.svg"
            >
              <source src="/Biba-Bop.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <img src="/functions/1.png" alt="Analyse de style" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-bibabop-navy mb-2">Analyse de style personnalisée</h3>
            <p className="text-gray-600">Découvrez votre style unique grâce à notre analyse détaillée de votre morphologie et de vos préférences.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <img src="/functions/2.png" alt="Conseils mode" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-bibabop-navy mb-2">Conseils mode experts</h3>
            <p className="text-gray-600">Bénéficiez des conseils de professionnels pour optimiser votre garde-robe et votre image.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <img src="/functions/3.png" alt="Garde-robe digitale" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-bibabop-navy mb-2">Garde-robe digitale</h3>
            <p className="text-gray-600">Organisez vos vêtements dans une garde-robe virtuelle et créez des looks facilement.</p>
          </div>
        </div>

        {/* Services Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <img src="/functions/clients.png" alt="Pour les clients" className="w-20 h-20 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-bibabop-navy mb-4">Pour les clients</h3>
            <p className="text-gray-600 mb-6">Transformez votre style avec l'aide de conseillers en image professionnels. Découvrez votre potentiel mode et créez une garde-robe qui vous ressemble.</p>
            <Button onClick={handleGetStarted} className="bg-bibabop-coral hover:bg-bibabop-coral/90">
              Commencer mon transformation
            </Button>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <img src="/functions/consultants.png" alt="Pour les conseillers" className="w-20 h-20 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-bibabop-navy mb-4">Pour les conseillers</h3>
            <p className="text-gray-600 mb-6">Rejoignez notre plateforme et développez votre activité de conseil en image. Accédez à des outils professionnels pour accompagner vos clients.</p>
            <Link to="/register/consultant">
              <Button variant="outline" className="border-bibabop-navy text-bibabop-navy hover:bg-bibabop-navy hover:text-white">
                Rejoindre la plateforme
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bibabop-navy text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2024 Biba-Bop. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
