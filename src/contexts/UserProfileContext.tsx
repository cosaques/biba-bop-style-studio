
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
    console.log('UserProfileProvider: fetchProfile called', { user: user?.email, loadingUser });
    
    if (!user) {
      console.log('UserProfileProvider: No user, setting loading to false');
      if (!loadingUser) {
        setLoading(false);
      }
      return;
    }

    try {
      console.log('UserProfileProvider: Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('UserProfileProvider: Error fetching user profile:', error);
      } else {
        console.log('UserProfileProvider: Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('UserProfileProvider: Exception fetching user profile:', error);
    } finally {
      console.log('UserProfileProvider: Setting loading to false');
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { error };
    }
  };

  useEffect(() => {
    console.log('UserProfileProvider: useEffect triggered', { user: user?.email, loadingUser });
    fetchProfile();
  }, [user, loadingUser]);

  const value = {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };

  console.log('UserProfileProvider: Rendering with values:', { profile: profile?.email, loading, user: user?.email });

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};
