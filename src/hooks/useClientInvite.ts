import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useClientInvite = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createInvite = async (email: string) => {
    if (!user) return { error: 'Not authenticated' };
    setLoading(true);
    const token = crypto.randomUUID();
    const { error } = await supabase.from('client_invites').insert({
      token,
      consultant_id: user.id,
      email,
    });
    setLoading(false);
    return { error, token };
  };

  const redeemInvite = async (token: string, clientId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('client_invites')
      .update({ used_at: new Date().toISOString(), used_by: clientId })
      .eq('token', token)
      .eq('used_at', null)
      .select('consultant_id, email')
      .maybeSingle();
    if (error || !data) {
      setLoading(false);
      return { error: error || 'Invalid token' };
    }
    const { error: linkError } = await supabase
      .from('consultant_clients')
      .insert({ consultant_id: data.consultant_id, client_id: clientId });
    setLoading(false);
    return { error: linkError };
  };

  return { createInvite, redeemInvite, loading };
};
