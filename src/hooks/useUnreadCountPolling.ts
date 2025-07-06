
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadCount } from '@/contexts/UnreadCountContext';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadCountPolling = () => {
  const { user } = useAuth();
  const { setUnreadCount } = useUnreadCount();

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_unread_count', {
          user_id: user.id
        });

        if (error) {
          console.error('Error fetching unread count:', error);
          return;
        }

        console.log('📊 Polled unread count:', data);
        setUnreadCount(data || 0);
      } catch (error) {
        console.error('Error in unread count polling:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every minute
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, [user?.id, setUnreadCount]);
};
