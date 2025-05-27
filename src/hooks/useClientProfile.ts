
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ClientProfile = Database['public']['Tables']['client_profiles']['Row'];
type ClientProfileInsert = Database['public']['Tables']['client_profiles']['Insert'];
type ClientProfileUpdate = Database['public']['Tables']['client_profiles']['Update'];

export const useClientProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching client profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching client profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Omit<ClientProfileInsert, 'user_id' | 'id'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .insert({
          ...profileData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client profile:', error);
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (error) {
      console.error('Error creating client profile:', error);
      return { error };
    }
  };

  const updateProfile = async (profileData: Partial<ClientProfileUpdate>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client profile:', error);
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (error) {
      console.error('Error updating client profile:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    refetch: fetchProfile
  };
};
