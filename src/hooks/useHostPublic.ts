import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Host, Experience } from '../types';

interface HostPublicData {
  host: Host;
  experiences: Experience[];
}

export const formatHostBusinessType = (type: string | null | undefined): string => {
  if (!type) return '';
  const labels: Record<string, string> = {
    restaurant: 'Restaurante',
    cafe: 'Café',
    bar: 'Bar',
    hotel: 'Hotel',
    tour: 'Tour',
    event: 'Eventos',
    individual: 'Negocio',
    business: 'Negocio',
  };
  return labels[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const useHostPublic = (hostId: string | undefined) => {
  return useQuery<HostPublicData>({
    queryKey: ['host-public', hostId],
    queryFn: async () => {
      if (!hostId) throw new Error('Host ID is required');

      const [hostResult, experiencesResult] = await Promise.all([
        supabase.from('hosts_public').select('*').eq('id', hostId).single(),
        supabase
          .from('experiences')
          .select('id,title,image_url,location,event_date,start_time,short_description,category,price')
          .eq('host_id', hostId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (hostResult.error) throw hostResult.error;
      return {
        host: hostResult.data as Host,
        experiences: (experiencesResult.data ?? []) as Experience[],
      };
    },
    enabled: !!hostId,
    staleTime: 60_000,
  });
};
