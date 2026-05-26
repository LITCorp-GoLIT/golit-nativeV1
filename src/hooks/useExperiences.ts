import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Experience } from '../types';

// Mirrors web useAllExperiences: is_active=true AND status='active', joins experience_media
const SELECT_FIELDS = `
  id, title, short_description, location, price, image_url, category,
  duration, is_featured, rating, total_reviews, booking_type,
  event_date, start_time, host_id, is_active, status, created_at,
  experience_media!left(url, is_primary, display_order)
`;

function resolvePrimaryImage(exp: any): string | null {
  const media: any[] = exp.experience_media ?? [];
  const primary = media.find((m) => m.is_primary)?.url;
  const first = [...media].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  )[0]?.url;
  return primary || first || exp.image_url || null;
}

export const useExperiences = (category?: string) => {
  return useQuery<Experience[]>({
    queryKey: ['experiences', category ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('experiences')
        .select(SELECT_FIELDS)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(60);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((exp: any) => ({
        ...exp,
        primary_image_url: resolvePrimaryImage(exp),
        experience_media: undefined,
      })) as Experience[];
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
};

export const useExperienceDetail = (id: string | undefined) => {
  return useQuery<Experience | null>({
    queryKey: ['experience', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('experiences')
        .select(`*, experience_media!left(url, is_primary, display_order)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      const exp = data as any;
      return {
        ...exp,
        primary_image_url: resolvePrimaryImage(exp),
        experience_media: undefined,
      } as Experience;
    },
    enabled: !!id,
    staleTime: 60_000,
  });
};

export const useFeaturedExperiences = () => {
  return useQuery<Experience[]>({
    queryKey: ['experiences', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select(SELECT_FIELDS)
        .eq('is_active', true)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []).map((exp: any) => ({
        ...exp,
        primary_image_url: resolvePrimaryImage(exp),
        experience_media: undefined,
      })) as Experience[];
    },
    staleTime: 5 * 60_000,
  });
};
