
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  useEffect(() => {
    if (!loading && !profileLoading) {
      // Allow access to password reset page even when authenticated
      if (location.pathname === '/password-reset') {
        return;
      }

      if (!user) {
        navigate('/login');
        return;
      }
      
      if (requiredRole && profile?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (profile?.role === 'client') {
          navigate('/client/dashboard');
        } else if (profile?.role === 'consultant') {
          navigate('/consultant/dashboard');
        } else {
          navigate('/login');
        }
      }
    }
  }, [user, profile, loading, profileLoading, navigate, requiredRole, location.pathname]);

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

  if (!user && location.pathname !== '/password-reset') {
    return null;
  }

  if (requiredRole && profile?.role !== requiredRole && location.pathname !== '/password-reset') {
    return null;
  }

  return <>{children}</>;
};
