import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

const LandingPage = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const getAccountUrl = () => {
    if (profile?.role === 'consultant') {
      return '/consultant/dashboard';
    } else if (profile?.role === 'client') {
      return '/client/dashboard';
    }
    return '/login';
  };

  return (
    <div className="min-h-screen bg-bibabop-cream">
      {/* Header */}
      <header className="bg-bibabop-navy text-[#e15b78] py-6">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Biba-Bop logo" className="h-15 w-auto" />
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault(); // Empêche le scroll natif
                const el = document.getElementById('features');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-bibabop-gold transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#clients"
              onClick={(e) => {
                e.preventDefault(); // Empêche le scroll natif
                const el = document.getElementById('clients');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-bibabop-gold transition-colors"
            >
              Pour les Clients
            </a>
            <a
              href="#consultants"
              onClick={(e) => {
                e.preventDefault(); // Empêche le scroll natif
                const el = document.getElementById('consultants');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-bibabop-gold transition-colors"
            >
              Pour les Conseillers
            </a>
            <a
              href="https://biba-bop.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-bibabop-gold transition-colors"
            >
              Biba-Bop Labs
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to={getAccountUrl()}>
                <Button className="bg-bibabop-gold text-bibabop-navy hover:bg-opacity-90">Mon Compte</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="bg-bibabop-gold text-bibabop-navy hover:bg-opacity-90">Connexion</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-bibabop-navy mb-6">
            Plateforme de Stylisme Intelligent
          </h1>
          <p className="text-xl md:text-2xl text-bibabop-charcoal max-w-3xl mx-auto mb-10">
            Biba-Bop révolutionne la collaboration entre conseillers en image et leurs clients pour une expérience de mode personnalisée et durable.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-16">
            <Link to="/register/client">
              <Button size="lg" className="btn-primary text-lg px-8 py-6">Je suis client</Button>
            </Link>
            <Link to="/register/consultant">
              <Button size="lg" className="btn-secondary text-lg px-8 py-6">Je suis conseiller</Button>
            </Link>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-bibabop-navy rounded-lg shadow-xl overflow-hidden">
              <video
                src="/Biba-Bop.mp4"
                controls
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-bibabop-navy text-center mb-16">
            Fonctionnalités principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-xl">Silhouette IA Personnalisée</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-bibabop-lightgrey rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src="/functions/1.png"
                    alt="Aperçu silhouette"
                    className="w-full h-full object-contain transform transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <p>
                  Créez une silhouette numérique basée sur votre morphologie pour des suggestions de style parfaitement adaptées.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-xl">Garde-robe Numérique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-bibabop-lightgrey rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src="/functions/2.png"
                    alt="Aperçu silhouette"
                    className="w-full h-full object-contain transform transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <p>Téléchargez et organisez vos vêtements pour créer des tenues et maximiser votre garde-robe existante.</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-xl">Création de Tenues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-bibabop-lightgrey rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src="/functions/3.png"
                    alt="Aperçu silhouette"
                    className="w-full h-full object-contain transform transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <p>Les conseillers peuvent créer des tenues personnalisées en faisant glisser les vêtements sur votre silhouette.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Client Section */}
      <section id="clients" className="py-20 bg-bibabop-lightgrey">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-bibabop-navy mb-6">
                Pour les Clients
              </h2>
              <p className="text-lg mb-6">
                Découvrez comment tirer le meilleur parti de votre garde-robe existante et recevez des conseils personnalisés de votre conseiller en image.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-bibabop-gold mr-2">✓</span>
                  <span>Intégration simple avec questionnaire en 5 étapes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-bibabop-gold mr-2">✓</span>
                  <span>Création de silhouette adaptée à votre morphologie</span>
                </li>
                <li className="flex items-start">
                  <span className="text-bibabop-gold mr-2">✓</span>
                  <span>Importation et amélioration des photos de vos vêtements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-bibabop-gold mr-2">✓</span>
                  <span>Visualisation des tenues créées par votre conseiller</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/register/client">
                  <Button className="btn-primary">Créer un compte client</Button>
                </Link>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="aspect-[3/4] bg-bibabop-navy rounded-md flex items-center justify-center overflow-hidden">
                <img
                  src="/functions/clients.png"
                  alt="Interface Client"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultant Section */}
      <section id="consultants" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-bibabop-lightgrey p-6 rounded-lg shadow-lg">
              <div className="aspect-[3/4] bg-bibabop-navy rounded-md flex items-center justify-center text-white">
                <img
                  src="/functions/consultants.png"
                  alt="Interface Consultant"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-serif font-bold text-bibabop-navy mb-6">
                Pour les Conseillers
              </h2>
              <p className="text-lg mb-6">
                Optimisez votre flux de travail, gagnez du temps et offrez une expérience professionnelle à vos clients.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-bibabop-gold mr-2">✓</span>
                  <span>Base de données clients organisée et facilement accessible</span>
                </li>
                <li className="flex items-start">
                  <span className="text-bibabop-gold mr-2">✓</span>
                  <span>Outils de création de tenues avec glisser-déposer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-bibabop-gold mr-2">✓</span>
                  <span>Partage direct des tenues et recueil des retours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-bibabop-gold mr-2">✓</span>
                  <span>Importation d'images externes pour compléter les tenues</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/register/consultant">
                  <Button className="btn-primary">Créer un compte conseiller</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-bibabop-navy text-[#e15b78] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Prêt à révolutionner votre expérience de stylisme ?
          </h2>
          <p className="text-xl max-w-3xl mx-auto mb-10">
            Rejoignez Biba-Bop dès aujourd'hui et découvrez une nouvelle façon de collaborer sur le style et la mode.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link to="/register/client">
              <Button className="btn-primary">
                Inscrivez-vous gratuitement
              </Button>
            </Link>
            <a href="mailto:contact@biba-bop.fr">
              <Button className="btn-secondary">
                Contactez-nous
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bibabop-charcoal text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Biba-Bop</h3>
              <p className="text-white/70">
                Plateforme de stylisme intelligent pour conseillers en image et leurs clients
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">Accueil</a></li>
                <li><a href="#features" onClick={(e) => {
                  e.preventDefault(); // Empêche le scroll natif
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="text-white/70 hover:text-white">Fonctionnalités</a></li>
                <li><a href="#clients" onClick={(e) => {
                  e.preventDefault(); // Empêche le scroll natif
                  const el = document.getElementById('clients');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="text-white/70 hover:text-white">Pour les Clients</a></li>
                <li><a href="#consultants" onClick={(e) => {
                  e.preventDefault(); // Empêche le scroll natif
                  const el = document.getElementById('consultants');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="text-white/70 hover:text-white">Pour les Conseillers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Ressources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Tutoriels</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Politique de confidentialité</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-12 pt-6 text-center text-white/50">
            <p>&copy; {new Date().getFullYear()} Biba-Bop. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Add this somewhere in the JSX where appropriate - you can place it in the navigation or footer */}
      <Link 
        to="/experimental/ai-dress" 
        className="text-xs text-gray-500 hover:text-purple-600 transition-colors"
      >
        🧪 AI Dress (Experimental)
      </Link>
    </div>
  );
};

export default LandingPage;
