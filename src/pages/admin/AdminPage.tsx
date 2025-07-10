
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const AdminPage = () => {
  const { impersonateUser } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImpersonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await impersonateUser(email, adminPassword);
      if (result.error) {
        setError(result.error.message);
      } else {
        toast({
          title: "Impersonation réussie",
          description: `Vous êtes maintenant connecté en tant que ${email}`,
        });
      }
    } catch (err) {
      setError('Erreur lors de l\'impersonation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Administration - Impersonation</CardTitle>
          <CardDescription>
            Fonctionnalité temporaire pour tester les comptes utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleImpersonate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de l'utilisateur</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Mot de passe administrateur</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="super-admin-mdp"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter en tant qu\'utilisateur'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Attention :</strong> Cette fonctionnalité est temporaire et uniquement pour les tests.
              Toutes les impersonations sont loggées pour audit.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
