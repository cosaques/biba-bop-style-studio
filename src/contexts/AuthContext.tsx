
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
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  const lastSessionRef = useRef<Session | null>(null);

  renderCountRef.current += 1;
  
  console.log("AuthContext: AuthProvider render", {
    renderCount: renderCountRef.current,
    timeSinceMount: Date.now() - mountTimeRef.current,
    hasUser: !!user,
    hasSession: !!session,
    loading,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.log("AuthContext: Setting up auth state listener", {
      timestamp: new Date().toISOString()
    });

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("AuthContext: Auth state change", {
          event,
          hasSession: !!newSession,
          hasUser: !!newSession?.user,
          timestamp: new Date().toISOString()
        });
        
        // Always update state for logout events, even if session comparison says they're the same
        const isLogoutEvent = event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED';
        const shouldUpdate = !isSameSession(lastSessionRef.current, newSession) || isLogoutEvent;
        
        if (shouldUpdate) {
          console.log("AuthContext: Session changed, updating state", {
            event,
            isLogoutEvent,
            timestamp: new Date().toISOString()
          });
          
          lastSessionRef.current = newSession;
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        } else {
          console.log("AuthContext: Session unchanged, skipping state update", {
            event,
            timestamp: new Date().toISOString()
          });
          
          // Still need to set loading to false on initial load
          if (loading) {
            setLoading(false);
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("AuthContext: Initial session check", {
        hasSession: !!initialSession,
        hasUser: !!initialSession?.user,
        timestamp: new Date().toISOString()
      });
      
      lastSessionRef.current = initialSession;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log("AuthContext: Cleaning up auth subscription", {
        timestamp: new Date().toISOString()
      });
      subscription.unsubscribe();
    };
  }, [loading]);

  const signIn = async (email: string, password: string) => {
    console.log("AuthContext: SignIn attempt", { email });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    console.log("AuthContext: SignUp attempt", { email, metadata });
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
    console.log("AuthContext: SignOut attempt");
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    console.log("AuthContext: Reset password attempt", { email });
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
