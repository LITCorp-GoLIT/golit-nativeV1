import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackContentView = async (
    contentType: string,
    contentId: string,
    metadata?: Record<string, unknown>,
  ) => {
    if (!user) return;
    try {
      await supabase.from('content_interactions').insert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        interaction_type: 'view',
        metadata: metadata ?? {},
        created_at: new Date().toISOString(),
      });
    } catch {
      // fire-and-forget
    }
  };

  return { trackContentView };
};
