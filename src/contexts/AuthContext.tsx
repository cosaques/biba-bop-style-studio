
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  impersonateUser: (email: string, adminPassword: string) => Promise<{ error: any; data?: any }>;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to compare sessions and prevent unnecessary updates
const isSameSession = (session1: Session | null, session2: Session | null): boolean => {
  if (!session1 && !session2) return true;
  if (!session1 || !session2) return false;
  
  return (
    session1.access_token === session2.access_token &&
    session1.refresh_token === session2.refresh_token &&
    session1.user.id === session2.user.id
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const lastSessionRef = useRef<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('🔍 AUTH STATE CHANGE:', JSON.stringify({
          event,
          sessionExists: !!newSession,
          userId: newSession?.user?.id,
          userEmail: newSession?.user?.email,
          isImpersonating,
          timestamp: new Date().toISOString()
        }));

        // Always update state for logout events, even if session comparison says they're the same
        const isLogoutEvent = event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED';
        const shouldUpdate = !isSameSession(lastSessionRef.current, newSession) || isLogoutEvent;
        
        if (shouldUpdate) {
          lastSessionRef.current = newSession;
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          
          // Reset impersonation flag on logout
          if (event === 'SIGNED_OUT') {
            console.log('🔍 CLEANING UP IMPERSONATION STATE ON LOGOUT');
            setIsImpersonating(false);
          }
        } else {
          // Still need to set loading to false on initial load
          if (loading) {
            setLoading(false);
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('🔍 INITIAL SESSION:', JSON.stringify({
        sessionExists: !!initialSession,
        userId: initialSession?.user?.id,
        userEmail: initialSession?.user?.email,
        timestamp: new Date().toISOString()
      }));

      lastSessionRef.current = initialSession;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loading]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { error };
  };

  const signOut = async () => {
    console.log('🔍 SIGN OUT:', JSON.stringify({
      wasImpersonating: isImpersonating,
      timestamp: new Date().toISOString()
    }));
    
    // If we're impersonating, clear everything immediately without calling supabase signOut
    if (isImpersonating) {
      console.log('🔍 CLEARING IMPERSONATION STATE IMMEDIATELY');
      setIsImpersonating(false);
      setUser(null);
      setSession(null);
      lastSessionRef.current = null;
      return;
    }
    
    // Normal signOut for real sessions
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });
    return { error };
  };

  const impersonateUser = async (email: string, adminPassword: string) => {
    console.log('🔍 IMPERSONATION ATTEMPT:', JSON.stringify({
      targetEmail: email,
      timestamp: new Date().toISOString()
    }));

    try {
      const { data, error } = await supabase.rpc('admin_impersonate_user', {
        user_email: email,
        admin_password: adminPassword
      });

      console.log('🔍 IMPERSONATION RPC RESULT:', JSON.stringify({
        success: !error,
        error: error?.message,
        userData: data,
        timestamp: new Date().toISOString()
      }));

      if (error) {
        return { error };
      }

      if (data) {
        // Créer un utilisateur fictif pour l'impersonation
        const impersonatedUser: User = {
          id: data.id,
          email: data.email,
          user_metadata: {
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
            profile_photo_url: data.profile_photo_url
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          phone_confirmed_at: null,
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          recovery_sent_at: null,
          email_change_sent_at: null,
          new_email: null,
          invited_at: null,
          action_link: null,
          email_change: null,
          phone_change: null,
          email_change_confirm_status: 0,
          phone_change_confirm_status: 0,
          banned_until: null,
          new_phone: null,
          is_anonymous: false,
          identities: []
        };

        // Créer une session fictive pour l'impersonation
        const impersonatedSession: Session = {
          access_token: `impersonated_${data.id}`,
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: `refresh_impersonated_${data.id}`,
          user: impersonatedUser
        };

        console.log('🔍 IMPERSONATION SUCCESS:', JSON.stringify({
          userId: data.id,
          userEmail: data.email,
          userRole: data.role,
          timestamp: new Date().toISOString()
        }));

        setUser(impersonatedUser);
        setSession(impersonatedSession);
        setIsImpersonating(true);
        lastSessionRef.current = impersonatedSession;

        return { data };
      }

      return { error: new Error('Données utilisateur non trouvées') };
    } catch (error) {
      console.log('🔍 IMPERSONATION ERROR:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }));
      
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    impersonateUser,
    isImpersonating,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
