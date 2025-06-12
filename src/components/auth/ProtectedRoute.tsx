
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  console.log('ProtectedRoute: Rendering with:', { 
    user: user?.email, 
    loading, 
    profile: profile?.email, 
    profileLoading, 
    requiredRole,
    profileRole: profile?.role 
  });

  useEffect(() => {
    console.log('ProtectedRoute: useEffect triggered', { 
      user: user?.email, 
      loading, 
      profileLoading, 
      profile: profile?.email, 
      requiredRole 
    });

    if (!loading && !profileLoading) {
      if (!user) {
        console.log('ProtectedRoute: No user found, redirecting to login');
        navigate('/login');
        return;
      }
      
      if (requiredRole && profile?.role !== requiredRole) {
        console.log('ProtectedRoute: Role mismatch', { 
          requiredRole, 
          userRole: profile?.role 
        });
        
        // Redirect to appropriate dashboard based on user role
        if (profile?.role === 'client') {
          navigate('/client/dashboard');
        } else if (profile?.role === 'consultant') {
          navigate('/consultant/dashboard');
        } else {
          console.log('ProtectedRoute: Unknown role, redirecting to login');
          navigate('/login');
        }
      }
    }
  }, [user, profile, loading, profileLoading, navigate, requiredRole]);

  if (loading || profileLoading) {
    console.log('ProtectedRoute: Still loading');
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
    console.log('ProtectedRoute: No user, rendering null');
    return null;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    console.log('ProtectedRoute: Role check failed, rendering null');
    return null;
  }

  console.log('ProtectedRoute: All checks passed, rendering children');
  return <>{children}</>;
};
