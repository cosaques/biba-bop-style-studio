import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClientInvite } from '@/hooks/useClientInvite';

const Invite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const { redeemInvite } = useClientInvite();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) return;
      const { data, error } = await supabase
        .from('client_invites')
        .select('email')
        .eq('token', token)
        .eq('used_at', null)
        .single();
      if (error || !data) {
        toast({ title: 'Invitation invalide', variant: 'destructive' });
        navigate('/login');
        return;
      }
      setEmail(data.email);
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();
      setHasAccount(!!existing);
      setLoading(false);
    };
    fetchInvite();
  }, [token, navigate, toast]);

  const handleLogin = async () => {
    setAuthLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else if (token && supabase.auth.getSession) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await redeemInvite(token, session.user.id);
      navigate('/client/dashboard');
    }
    setAuthLoading(false);
  };

  const handleSignup = async () => {
    setAuthLoading(true);
    const { error } = await signUp(email, password, { role: 'client' });
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else if (token && supabase.auth.getSession) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await redeemInvite(token, session.user.id);
      navigate('/client/onboarding');
    }
    setAuthLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{hasAccount ? 'Connexion' : 'Inscription'}</CardTitle>
            <CardDescription>
              {hasAccount ? 'Connectez-vous pour rejoindre votre consultant' : 'Créez votre compte pour rejoindre votre consultant'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" value={email} disabled className="bg-muted" />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            {hasAccount ? (
              <Button className="btn-primary w-full" onClick={handleLogin} disabled={authLoading}>
                {authLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            ) : (
              <Button className="btn-primary w-full" onClick={handleSignup} disabled={authLoading}>
                {authLoading ? 'Inscription...' : 'Créer un compte'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Invite;
