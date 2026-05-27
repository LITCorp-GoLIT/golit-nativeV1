import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Booking } from '../types';

export interface BookingInput {
  activityId: string;
  bookingDate: string;
  bookingTime: string;
  quantity: number;
  totalPrice: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
}

export const useCreateBooking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BookingInput) => {
      if (!user) throw new Error('Debes iniciar sesión para reservar');

      const { data, error } = await supabase
        .from('activity_bookings')
        .insert({
          activity_id: input.activityId,
          user_id: user.id,
          booking_date: input.bookingDate,
          booking_time: input.bookingTime,
          quantity: input.quantity,
          total_price: input.totalPrice,
          guest_name: input.guestName ?? null,
          guest_email: input.guestEmail ?? user.email ?? null,
          guest_phone: input.guestPhone ?? null,
          special_requests: input.specialRequests ?? null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      supabase.functions
        .invoke('send-activity-booking-confirmation', { body: { bookingId: data.id, type: 'confirmation' } })
        .catch(() => {});

      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

export const useCreatePayPalOrder = () =>
  useMutation({
    mutationFn: async ({ experienceId, amount }: { experienceId: string; amount: number }) => {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: { experienceId, amount, currency: 'USD' },
      });
      if (error) throw error;
      return data as { approvalUrl: string; orderId: string };
    },
  });

export const useCapturePayPalOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, bookingId }: { orderId: string; bookingId: string }) => {
      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderId, bookingId },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      return data;
    },
  });
};

export const useMyBookings = () => {
  const { user } = useAuth();

  return useQuery<Booking[]>({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('activity_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
};

export const useCancelBooking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('activity_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};
