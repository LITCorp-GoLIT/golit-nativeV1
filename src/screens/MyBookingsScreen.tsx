import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMyBookings, useCancelBooking } from '../hooks/useBooking';
import { Booking, RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:         { label: 'Pendiente',       color: '#F59E0B' },
  confirmed:       { label: 'Confirmada',      color: '#10B981' },
  cancelled:       { label: 'Cancelada',       color: '#EF4444' },
  pending_payment: { label: 'Pago pendiente',  color: '#6366F1' },
};

const BookingCard: React.FC<{ booking: Booking; onCancel: (id: string) => void }> = ({ booking, onCancel }) => {
  const status = STATUS_LABEL[booking.status] ?? { label: booking.status, color: '#888' };
  const date = new Date(booking.booking_date).toLocaleDateString('es-GT', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardId}>#{booking.id.slice(0, 8).toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: status.color + '22' }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <Feather name="calendar" size={13} color="rgba(255,255,255,0.4)" />
        <Text style={styles.metaText}>{date}  {booking.booking_time}</Text>
      </View>
      <View style={styles.cardMeta}>
        <Feather name="users" size={13} color="rgba(255,255,255,0.4)" />
        <Text style={styles.metaText}>{booking.quantity} {booking.quantity === 1 ? 'persona' : 'personas'}</Text>
      </View>
      <View style={styles.cardMeta}>
        <Feather name="tag" size={13} color="rgba(255,255,255,0.4)" />
        <Text style={styles.metaText}>
          {booking.total_price === 0 ? 'Gratis' : `Q${booking.total_price.toLocaleString()}`}
        </Text>
      </View>

      {(booking.status === 'pending' || booking.status === 'pending_payment') && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => onCancel(booking.id)}
          activeOpacity={0.75}
        >
          <Text style={styles.cancelBtnText}>Cancelar reserva</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { data: bookings = [], isLoading, refetch } = useMyBookings();
  const cancelBooking = useCancelBooking();

  const handleCancel = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que quieres cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => cancelBooking.mutate(id),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis reservas</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#E8621A" size="large" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.center}>
          <Feather name="calendar" size={40} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyTitle}>Sin reservas aún</Text>
          <Text style={styles.emptySub}>Explora experiencias y reserva tu próximo plan</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.exploreBtnText}>Explorar planes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <BookingCard booking={item} onCancel={handleCancel} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.md },
  emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.sm, textAlign: 'center', marginTop: 6 },
  exploreBtn: {
    marginTop: Spacing.lg,
    backgroundColor: '#E8621A',
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  exploreBtnText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '700' },
  list: { padding: Spacing.base, gap: Spacing.sm },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    gap: 8,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardId: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
  cancelBtn: {
    marginTop: 4,
    borderRadius: Radius.md,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#EF444466',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#EF4444', fontSize: FontSize.sm, fontWeight: '600' },
});
