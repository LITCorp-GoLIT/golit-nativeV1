import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHostStatus } from '../hooks/useHostStatus';
import { useHostBookings, useHostCheckins, useHostReport } from '../hooks/useHostDashboard';
import { Booking, RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabId = 'bookings' | 'checkins' | 'report';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'bookings', label: 'Reservas',  icon: 'calendar' },
  { id: 'checkins', label: 'Checkins',  icon: 'check-square' },
  { id: 'report',   label: 'Reporte',   icon: 'bar-chart-2' },
];

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  pending:         { label: 'Pendiente',  color: '#F59E0B' },
  confirmed:       { label: 'Confirmada', color: '#10B981' },
  cancelled:       { label: 'Cancelada',  color: '#EF4444' },
  pending_payment: { label: 'Sin pago',   color: '#6366F1' },
};

const BookingRow: React.FC<{ booking: Booking }> = ({ booking }) => {
  const s = STATUS_STYLE[booking.status] ?? { label: booking.status, color: '#888' };
  return (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>#{booking.id.slice(0, 8).toUpperCase()}</Text>
        <Text style={styles.rowMeta}>
          {booking.booking_date}  ·  {booking.quantity} persona{booking.quantity !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.rowMeta}>
          Q{booking.total_price.toLocaleString()}
          {booking.guest_name ? `  ·  ${booking.guest_name}` : ''}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: s.color + '22' }]}>
        <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
      </View>
    </View>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color?: string }> = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: (color ?? '#E8621A') + '22' }]}>
      <Feather name={icon as any} size={20} color={color ?? '#E8621A'} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const HostDashboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { hostData, loading: statusLoading } = useHostStatus();
  const [activeTab, setActiveTab] = useState<TabId>('bookings');
  const [refreshing, setRefreshing] = useState(false);

  const hostId = hostData?.id;
  const { data: bookings = [], isLoading: bLoading, refetch: refetchB } = useHostBookings(hostId);
  const { data: checkins = [], isLoading: cLoading, refetch: refetchC } = useHostCheckins(hostId);
  const { data: report, isLoading: rLoading, refetch: refetchR } = useHostReport(hostId);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchB(), refetchC(), refetchR()]);
    setRefreshing(false);
  };

  if (statusLoading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#E8621A" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{hostData?.business_name ?? 'Dashboard'}</Text>
          {hostData?.is_verified && (
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={12} color="#3B82F6" />
              <Text style={styles.verifiedText}>Verificado</Text>
            </View>
          )}
        </View>
        {hostId && (
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => navigation.navigate('QRScan', { hostId })}
          >
            <Feather name="camera" size={20} color="#E8621A" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab.id); }}
          >
            <Feather name={tab.icon as any} size={14} color={activeTab === tab.id ? '#E8621A' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8621A" />}
      >
        {activeTab === 'bookings' && (
          <View style={styles.section}>
            {bLoading ? (
              <ActivityIndicator color="#E8621A" style={{ marginTop: 40 }} />
            ) : bookings.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="calendar" size={32} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyText}>Sin reservas aún</Text>
              </View>
            ) : (
              bookings.map((b) => <BookingRow key={b.id} booking={b} />)
            )}
          </View>
        )}

        {activeTab === 'checkins' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Checkins verificados</Text>
              {hostId && (
                <TouchableOpacity
                  style={styles.scanBtn}
                  onPress={() => navigation.navigate('QRScan', { hostId })}
                >
                  <Feather name="camera" size={14} color="#E8621A" />
                  <Text style={styles.scanBtnText}>Escanear QR</Text>
                </TouchableOpacity>
              )}
            </View>
            {cLoading ? (
              <ActivityIndicator color="#E8621A" style={{ marginTop: 40 }} />
            ) : checkins.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="check-square" size={32} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyText}>Sin checkins aún</Text>
                <Text style={styles.emptySub}>Usa el escáner QR para verificar asistencias</Text>
              </View>
            ) : (
              checkins.map((c) => (
                <View key={c.id} style={styles.row}>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{c.customer_name}</Text>
                    <Text style={styles.rowMeta}>{c.event_title}</Text>
                    <Text style={styles.rowMeta}>
                      {c.scanned_at ? new Date(c.scanned_at).toLocaleString('es-GT') : 'Sin hora'}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#10B98122' }]}>
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>✓</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'report' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Últimos 30 días</Text>
            {rLoading ? (
              <ActivityIndicator color="#E8621A" style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.statsGrid}>
                <StatCard icon="package" label="Planes publicados"  value={report?.plansPublished ?? 0} />
                <StatCard icon="calendar" label="Reservas totales"  value={report?.totalBookings ?? 0} />
                <StatCard icon="clock"    label="Pendientes"        value={report?.pendingBookings ?? 0} color="#F59E0B" />
                <StatCard icon="dollar-sign" label="Ingresos confirmados" value={`Q${(report?.totalRevenue ?? 0).toLocaleString()}`} color="#10B981" />
              </View>
            )}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, paddingHorizontal: Spacing.sm },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verifiedText: { color: '#3B82F6', fontSize: FontSize.xs, fontWeight: '600' },
  qrBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8621A1A', justifyContent: 'center', alignItems: 'center' },
  tabs: {
    flexDirection: 'row', backgroundColor: '#0E0E10',
    borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A',
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#E8621A' },
  tabLabel: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.xs, fontWeight: '600' },
  tabLabelActive: { color: '#E8621A' },
  section: { padding: Spacing.base },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.md },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8621A22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  scanBtnText: { color: '#E8621A', fontSize: FontSize.xs, fontWeight: '600' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: Radius.lg, padding: Spacing.base,
    borderWidth: 0.5, borderColor: '#2A2A2A', marginBottom: Spacing.sm,
  },
  rowBody: { flex: 1 },
  rowTitle: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '700', marginBottom: 2 },
  rowMeta: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.xs },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '600' },
  emptySub: { color: 'rgba(255,255,255,0.35)', fontSize: FontSize.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#1A1A1A',
    borderRadius: Radius.lg, padding: Spacing.base,
    borderWidth: 0.5, borderColor: '#2A2A2A', alignItems: 'center', gap: 6,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.xs, textAlign: 'center' },
});
