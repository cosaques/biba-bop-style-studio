
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const AdminPage = () => {
  const { impersonateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImpersonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔍 ADMIN LOGIN ATTEMPT:', JSON.stringify({
      email,
      timestamp: new Date().toISOString()
    }));

    try {
      const result = await impersonateUser(email, adminPassword);
      
      console.log('🔍 ADMIN LOGIN RESULT:', JSON.stringify({
        success: !result.error,
        error: result.error?.message,
        userData: result.data,
        timestamp: new Date().toISOString()
      }));

      if (result.error) {
        setError(result.error.message);
      } else {
        toast({
          title: "Impersonation réussie",
          description: `Vous êtes maintenant connecté en tant que ${email}`,
        });

        // Redirection basée sur le rôle
        if (result.data?.role === 'client') {
          console.log('🔍 REDIRECTING TO CLIENT DASHBOARD');
          navigate('/client/dashboard');
        } else if (result.data?.role === 'consultant') {
          console.log('🔍 REDIRECTING TO CONSULTANT DASHBOARD');
          navigate('/consultant/dashboard');
        } else {
          console.log('🔍 UNKNOWN ROLE:', result.data?.role);
          setError('Rôle utilisateur non reconnu');
        }
      }
    } catch (err) {
      console.log('🔍 ADMIN LOGIN ERROR:', JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString()
      }));
      
      setError('Erreur lors de l\'impersonation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleImpersonate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Mot de passe</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="*****"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
