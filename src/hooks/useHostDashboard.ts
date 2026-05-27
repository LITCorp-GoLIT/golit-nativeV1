import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

export interface HostCheckin {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  tariff: number | null;
  scanned_at: string | null;
  created_at: string;
  event_title: string;
  customer_name: string;
}

export interface HostReportData {
  plansPublished: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  rangeDays: number;
}

export const useHostBookings = (hostId: string | undefined) =>
  useQuery<Booking[]>({
    queryKey: ['host-bookings', hostId],
    enabled: !!hostId,
    queryFn: async () => {
      // Get host's experience IDs first
      const { data: exps } = await supabase
        .from('experiences')
        .select('id')
        .eq('host_id', hostId!)
        .eq('is_active', true);

      if (!exps?.length) return [];

      const expIds = exps.map((e) => e.id);
      const { data, error } = await supabase
        .from('activity_bookings')
        .select('*')
        .in('activity_id', expIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []) as Booking[];
    },
    staleTime: 60_000,
    refetchInterval: 30_000,
  });

export const useHostCheckins = (hostId: string | undefined) =>
  useQuery<HostCheckin[]>({
    queryKey: ['host-checkins', hostId],
    enabled: !!hostId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select('id, event_id, user_id, status, tariff, scanned_at, created_at')
        .eq('venue_id', hostId!)
        .eq('status', 'verified')
        .order('scanned_at', { ascending: false })
        .limit(100);

      if (error) { console.warn('useHostCheckins:', error.message); return []; }

      const rows = data ?? [];
      if (!rows.length) return [];

      const eventIds = [...new Set(rows.map((r) => r.event_id))];
      const userIds  = [...new Set(rows.map((r) => r.user_id))];

      const [{ data: events }, { data: profiles }] = await Promise.all([
        supabase.from('experiences').select('id, title').in('id', eventIds),
        supabase.from('profiles').select('id, full_name').in('id', userIds),
      ]);

      const eMap = new Map((events ?? []).map((e: any) => [e.id, e.title]));
      const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name]));

      return rows.map((r) => ({
        ...r,
        event_title: eMap.get(r.event_id) ?? 'Evento',
        customer_name: pMap.get(r.user_id) ?? 'Cliente',
      })) as HostCheckin[];
    },
    staleTime: 30_000,
  });

export const useHostReport = (hostId: string | undefined) =>
  useQuery<HostReportData>({
    queryKey: ['host-report', hostId],
    enabled: !!hostId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data: exps } = await supabase
        .from('experiences')
        .select('id')
        .eq('host_id', hostId!)
        .eq('is_active', true);

      const expIds = (exps ?? []).map((e) => e.id);
      if (!expIds.length) {
        return { plansPublished: 0, totalBookings: 0, totalRevenue: 0, pendingBookings: 0, rangeDays: 30 };
      }

      const { data: bookings } = await supabase
        .from('activity_bookings')
        .select('status, total_price')
        .in('activity_id', expIds);

      const all = bookings ?? [];
      return {
        plansPublished: expIds.length,
        totalBookings: all.length,
        totalRevenue: all.filter((b) => b.status === 'confirmed').reduce((s, b) => s + (b.total_price ?? 0), 0),
        pendingBookings: all.filter((b) => b.status === 'pending').length,
        rangeDays: 30,
      };
    },
  });

export const useVerifyCheckin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, hostId }: { bookingId: string; hostId: string }) => {
      const { data, error } = await supabase.functions.invoke('verify-checkin', {
        body: { bookingId, hostId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { hostId }) => {
      queryClient.invalidateQueries({ queryKey: ['host-checkins', hostId] });
    },
  });
};
