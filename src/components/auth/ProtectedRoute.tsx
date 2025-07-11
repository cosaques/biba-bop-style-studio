
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

  console.log("ProtectedRoute - user:", user?.id, "profile:", profile?.role, "requiredRole:", requiredRole);
  console.log("ProtectedRoute - loading states - auth:", loading, "profile:", profileLoading);

  useEffect(() => {
    console.log("ProtectedRoute useEffect triggered");
    console.log("Auth loading:", loading, "Profile loading:", profileLoading);
    console.log("User:", user?.id, "Profile role:", profile?.role, "Required role:", requiredRole);

    // Wait for both auth and profile to finish loading
    if (!loading && !profileLoading) {
      console.log("Both loading states are false, processing redirection logic");
      
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate('/login');
        return;
      }
      
      // If a specific role is required, check if user has that role
      if (requiredRole && profile?.role !== requiredRole) {
        console.log(`Role mismatch: expected ${requiredRole}, got ${profile?.role}`);
        // Redirect to appropriate dashboard based on user role
        if (profile?.role === 'client') {
          console.log("Redirecting client to client dashboard");
          navigate('/client/dashboard');
        } else if (profile?.role === 'consultant') {
          console.log("Redirecting consultant to consultant dashboard");
          navigate('/consultant/dashboard');
        } else {
          console.log("Unknown role, redirecting to login");
          navigate('/login');
        }
      } else {
        console.log("User and role check passed, allowing access");
      }
    } else {
      console.log("Still loading, waiting...");
    }
  }, [user, profile, loading, profileLoading, navigate, requiredRole]);

  // Show loading while either auth or profile is loading
  if (loading || profileLoading) {
    console.log("Showing loading screen");
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
    console.log("No user, returning null (should redirect)");
    return null;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    console.log("Role check failed, returning null (should redirect)");
    return null;
  }

  console.log("All checks passed, rendering children");
  return <>{children}</>;
};
