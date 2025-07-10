
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
  const { user, loading: loadingUser, isImpersonating } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      if (!loadingUser) {
        setLoading(false);
      }
      return;
    }
    
    try {
      setLoading(true);
      
      // For impersonated users, create profile from user metadata
      if (isImpersonating) {
        console.log('🔍 CREATING PROFILE FROM IMPERSONATED USER METADATA');
        const fakeProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: user.user_metadata?.role || 'client',
          profile_photo_url: user.user_metadata?.profile_photo_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fakeProfile);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'User not authenticated' };

    // For impersonated users, simulate the update
    if (isImpersonating) {
      console.log('🔍 SIMULATING PROFILE UPDATE FOR IMPERSONATED USER');
      const updatedProfile = { ...profile, ...updates } as UserProfile;
      setProfile(updatedProfile);
      return { data: updatedProfile };
    }

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
    fetchProfile();
  }, [user, loadingUser, isImpersonating]);

  const value = {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};
