
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, isImpersonating } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 PROTECTED ROUTE CHECK:', JSON.stringify({
      hasUser: !!user,
      userEmail: user?.email,
      profileRole: profile?.role,
      requiredRole,
      isLoading: loading,
      isProfileLoading: profileLoading,
      isImpersonating,
      userMetadataRole: user?.user_metadata?.role,
      timestamp: new Date().toISOString()
    }));

    if (!loading && !profileLoading) {
      if (!user) {
        console.log('🔍 NO USER - REDIRECTING TO LOGIN');
        navigate('/login');
        return;
      }
      
      // Pour l'impersonation, utiliser le rôle des métadonnées utilisateur
      const userRole = isImpersonating ? user.user_metadata?.role : profile?.role;
      
      console.log('🔍 USER ROLE DETERMINED:', JSON.stringify({
        userRole,
        isImpersonating,
        profileRole: profile?.role,
        metadataRole: user.user_metadata?.role
      }));
      
      if (requiredRole && userRole !== requiredRole) {
        console.log('🔍 ROLE MISMATCH - REDIRECTING');
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'client') {
          navigate('/client/dashboard');
        } else if (userRole === 'consultant') {
          navigate('/consultant/dashboard');
        } else {
          navigate('/login');
        }
      }
    }
  }, [user, profile, loading, profileLoading, navigate, requiredRole, isImpersonating]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = isImpersonating ? user.user_metadata?.role : profile?.role;
  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};
