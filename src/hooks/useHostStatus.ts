import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface HostData {
  id: string;
  user_id: string;
  business_name: string;
  rating: number | null;
  total_reviews: number | null;
  total_experiences: number | null;
  total_bookings: number | null;
  is_verified: boolean;
  is_active: boolean;
}

export interface HostApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
}

export interface HostStatus {
  isHost: boolean;
  hasApplication: boolean;
  applicationStatus: 'pending' | 'approved' | 'rejected' | null;
  hostData: HostData | null;
  applicationData: HostApplication | null;
  loading: boolean;
}

export const useHostStatus = (): HostStatus => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['host-status', user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const [{ data: hostData }, { data: appData }] = await Promise.all([
        supabase.from('hosts').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase
          .from('host_applications')
          .select('id, status, rejection_reason, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return { hostData, applicationData: appData };
    },
  });

  if (!user?.id) {
    return { isHost: false, hasApplication: false, applicationStatus: null, hostData: null, applicationData: null, loading: false };
  }

  const hostData = (data?.hostData ?? null) as HostData | null;
  const applicationData = (data?.applicationData ?? null) as HostApplication | null;

  return {
    isHost: hostData?.is_active ?? false,
    hasApplication: !!applicationData,
    applicationStatus: applicationData?.status ?? null,
    hostData,
    applicationData,
    loading: isLoading,
  };
};

export interface HostApplicationInput {
  businessName: string;
  businessType: 'individual' | 'company' | 'organization';
  description: string;
  experienceDescription: string;
  experienceType: string[];
  phone: string;
  address: string;
  city: string;
  country: string;
  instagram?: string;
  website?: string;
}

export const useSubmitHostApplication = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HostApplicationInput) => {
      if (!user) throw new Error('Debes iniciar sesión para aplicar como anfitrión');

      const { data: existing } = await supabase
        .from('host_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.status === 'pending') {
        throw new Error('Ya tienes una solicitud pendiente. Te notificaremos cuando sea revisada.');
      }

      const { data, error } = await supabase
        .from('host_applications')
        .insert({
          user_id: user.id,
          business_name: input.businessName,
          business_type: input.businessType,
          description: input.description,
          experience_description: input.experienceDescription,
          experience_type: input.experienceType,
          address: input.address,
          city: input.city,
          country: input.country,
          additional_social_media: input.instagram ? { instagram: input.instagram } : null,
        })
        .select()
        .single();

      if (error) throw error;

      supabase.functions
        .invoke('send-host-application-email', { body: { applicationId: data.id } })
        .catch(() => {});

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-status'] });
    },
  });
};
