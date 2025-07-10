
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

const ImpersonationBanner = () => {
  const { isImpersonating, signOut, user } = useAuth();

  if (!isImpersonating) {
    return null;
  }

  return (
    <Alert className="bg-orange-50 border-orange-200 text-orange-800 mb-4">
      <UserX className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Mode Impersonation :</strong> Vous êtes connecté en tant que {user?.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="ml-4 border-orange-300 text-orange-800 hover:bg-orange-100"
        >
          Arrêter l'impersonation
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ImpersonationBanner;
