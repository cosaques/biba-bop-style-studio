
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
  const lastSessionRef = useRef<Session | null>(null);

  console.log("AuthProvider - current state:", { user: user?.id, loading });

  useEffect(() => {
    console.log("AuthProvider useEffect - setting up auth state listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, "User:", newSession?.user?.id);
        
        // Always update state for logout events, even if session comparison says they're the same
        const isLogoutEvent = event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED';
        const shouldUpdate = !isSameSession(lastSessionRef.current, newSession) || isLogoutEvent;
        
        if (shouldUpdate) {
          console.log("Updating auth state - event:", event, "user:", newSession?.user?.id);
          lastSessionRef.current = newSession;
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        } else {
          // Still need to set loading to false on initial load
          if (loading) {
            console.log("Setting loading to false (same session)");
            setLoading(false);
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session loaded:", initialSession?.user?.id);
      lastSessionRef.current = initialSession;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, [loading]);

  const signIn = async (email: string, password: string) => {
    console.log("SignIn attempt for:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log("SignIn result - error:", error);
    return { error };
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    console.log("SignUp attempt for:", email, "with role:", metadata.role);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    console.log("SignUp result - error:", error);
    return { error };
  };

  const signOut = async () => {
    console.log("SignOut requested");
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
