import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { publicSupabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Review } from '../types';

export const useReviews = (targetType: string, targetId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['reviews', targetType, targetId];

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await publicSupabase
        .from('reviews')
        .select('*')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false });

      if (error) { console.warn('useReviews:', error.message); return []; }

      const userIds = [...new Set((data ?? []).map((r: any) => r.user_id))];
      let profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await publicSupabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        (profiles ?? []).forEach((p: any) => {
          profileMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      return (data ?? []).map((r: any) => ({
        ...r,
        user_name: profileMap[r.user_id]?.full_name ?? 'Usuario',
        user_avatar: profileMap[r.user_id]?.avatar_url ?? null,
      })) as Review[];
    },
    staleTime: 60_000,
    retry: false,
  });

  const userReview = reviews.find((r) => r.user_id === user?.id) ?? null;

  const submitReview = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment?: string }) => {
      if (!user) throw new Error('Debes iniciar sesión para dejar una reseña');

      if (userReview) {
        const { error } = await supabase
          .from('reviews')
          .update({ rating, comment: comment ?? null })
          .eq('id', userReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert({ user_id: user.id, target_type: targetType, target_id: targetId, rating, comment: comment ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return { reviews, isLoading, userReview, submitReview, avgRating };
};
