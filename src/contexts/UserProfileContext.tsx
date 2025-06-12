
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: any; data?: UserProfile }>;
  refetch: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    console.log('UserProfileContext: fetchProfile called', { user: user?.email, loadingUser });
    
    if (!user) {
      console.log('UserProfileContext: No user, setting loading to false');
      if (!loadingUser) {
        setLoading(false);
      }
      return;
    }

    console.log('UserProfileContext: Fetching profile for user:', user.id);
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('UserProfileContext: Profile fetch result', { data, error });

      if (error) {
        console.error('UserProfileContext: Error fetching user profile:', error);
        setProfile(null);
      } else {
        console.log('UserProfileContext: Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('UserProfileContext: Error fetching user profile:', error);
      setProfile(null);
    } finally {
      console.log('UserProfileContext: Setting loading to false');
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    console.log('UserProfileContext: updateProfile called', { updates, user: user?.email });
    
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      console.log('UserProfileContext: Profile update result', { data, error });

      if (error) {
        console.error('UserProfileContext: Error updating user profile:', error);
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (error) {
      console.error('UserProfileContext: Error updating user profile:', error);
      return { error };
    }
  };

  useEffect(() => {
    console.log('UserProfileContext: useEffect triggered', { user: user?.email, loadingUser });
    fetchProfile();
  }, [user, loadingUser]);

  console.log('UserProfileContext: Rendering with values:', { 
    profile: profile?.role || 'undefined', 
    loading, 
    user: user?.email || 'undefined' 
  });

  const value = {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};
