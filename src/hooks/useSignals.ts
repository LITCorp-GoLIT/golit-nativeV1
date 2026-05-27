import { useQuery } from '@tanstack/react-query';
import { publicSupabase } from '../lib/supabase';
import { Signal } from '../types';

export const useSignals = () =>
  useQuery<Signal[]>({
    queryKey: ['signals'],
    queryFn: async () => {
      const { data, error } = await publicSupabase
        .from('signals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        // signals table may not exist yet — return empty array gracefully
        console.warn('useSignals:', error.message);
        return [];
      }
      return (data ?? []) as Signal[];
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
