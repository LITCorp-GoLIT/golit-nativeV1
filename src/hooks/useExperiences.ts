import { useQuery } from '@tanstack/react-query';
import { publicSupabase } from '../lib/supabase';
import { Experience } from '../types';

const computePrimaryImage = (exp: any): string | null => {
  const media: any[] = exp.experience_media || [];
  const primary = media.find((m) => m.is_primary)?.url;
  const first = [...media]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))[0]?.url;
  return primary || first || exp.image_url || null;
};

export const useAllExperiences = () =>
  useQuery<Experience[]>({
    queryKey: ['experiences', 'all'],
    queryFn: async () => {
      const { data, error } = await publicSupabase
        .from('experiences')
        .select('*, experience_media!left(url, is_primary, display_order)')
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((exp: any) => ({
        ...exp,
        primary_image_url: computePrimaryImage(exp),
        experience_media: undefined,
      })) as Experience[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

export const useFeaturedExperiences = () =>
  useQuery<Experience[]>({
    queryKey: ['experiences', 'featured'],
    queryFn: async () => {
      const { data, error } = await publicSupabase
        .from('experiences')
        .select('*, experience_media!left(url, is_primary, display_order)')
        .eq('is_active', true)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((exp: any) => ({
        ...exp,
        primary_image_url: computePrimaryImage(exp),
        experience_media: undefined,
      })) as Experience[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

export const useUpcomingEvents = () =>
  useQuery<Experience[]>({
    queryKey: ['experiences', 'upcoming'],
    queryFn: async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data, error } = await publicSupabase
        .from('experiences')
        .select('*, experience_media!left(url, is_primary, display_order)')
        .eq('is_active', true)
        .eq('status', 'active')
        .gte('event_date', tomorrow.toISOString().split('T')[0])
        .lte('event_date', nextWeek.toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      return (data || []).map((exp: any) => ({
        ...exp,
        primary_image_url: computePrimaryImage(exp),
        experience_media: undefined,
      })) as Experience[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

// Backwards-compat aliases used by SearchScreen / ExperienceDetailScreen
export const useExperiences = useAllExperiences;

export const useExperienceDetail = (id: string) =>
  useQuery<Experience | null>({
    queryKey: ['experience', id],
    queryFn: async () => {
      const { data, error } = await publicSupabase
        .from('experiences')
        .select('*, experience_media!left(url, is_primary, display_order)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        ...data,
        primary_image_url: computePrimaryImage(data),
        experience_media: undefined,
      } as Experience;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
