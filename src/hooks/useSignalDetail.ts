import { useQuery } from '@tanstack/react-query';
import { publicSupabase } from '../lib/supabase';
import { Signal } from '../types';

export interface SignalBusiness {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  type: string | null;
  category: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  rating: number | null;
  review_count: number | null;
  website: string | null;
}

export interface SignalWithBusiness extends Signal {
  businesses: SignalBusiness | null;
}

export const useSignalDetail = (id: string | undefined) =>
  useQuery<SignalWithBusiness | null>({
    queryKey: ['signal-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await publicSupabase
        .from('signals')
        .select('*, businesses(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as SignalWithBusiness | null;
    },
    enabled: !!id,
    staleTime: 30_000,
    retry: false,
  });
