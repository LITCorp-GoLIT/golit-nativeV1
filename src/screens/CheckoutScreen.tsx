import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useExperienceDetail } from '../hooks/useExperiences';
import { useCreateBooking, useCreatePayPalOrder } from '../hooks/useBooking';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { RootStackParamList } from '../types';

type RouteParams = RouteProp<RootStackParamList, 'Checkout'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const todayStr = () => new Date().toISOString().split('T')[0];

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { experienceId } = route.params;

  const { user } = useAuth();
  const { data: exp, isLoading } = useExperienceDetail(experienceId);
  const createBooking = useCreateBooking();
  const createPayPalOrder = useCreatePayPalOrder();

  const [quantity, setQuantity] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const bookingDate = exp?.event_date ?? todayStr();
  const bookingTime = exp?.start_time?.slice(0, 5) ?? '10:00';
  const total = useMemo(() => (exp?.price ?? 0) * quantity, [exp, quantity]);
  const isFree = exp?.booking_type === 'free' || (exp?.price ?? 0) === 0;

  if (isLoading || !exp) return <LoadingSpinner fullScreen />;

  const handleConfirm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isFree || exp.booking_type === 'contact') {
      const result = await createBooking.mutateAsync({
        activityId: exp.id,
        bookingDate,
        bookingTime,
        quantity,
        totalPrice: total,
        guestName: guestName.trim() || undefined,
        guestEmail: user?.email ?? undefined,
        guestPhone: guestPhone.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
      });
      navigation.replace('OrderConfirmation', {
        bookingId: result.id,
        experienceTitle: exp.title,
      });
      return;
    }

    // Paid — initiate PayPal
    try {
      const { approvalUrl, orderId } = await createPayPalOrder.mutateAsync({
        experienceId: exp.id,
        amount: total,
      });
      // Create booking in pending_payment state first
      const booking = await createBooking.mutateAsync({
        activityId: exp.id,
        bookingDate,
        bookingTime,
        quantity,
        totalPrice: total,
        guestName: guestName.trim() || undefined,
        guestEmail: user?.email ?? undefined,
        guestPhone: guestPhone.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
      });
      // Update status to pending_payment
      navigation.navigate('PayPalWebView', {
        approvalUrl,
        bookingId: booking.id,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo iniciar el pago');
    }
  };

  const busy = createBooking.isPending || createPayPalOrder.isPending;

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar reserva</Text>
        <View style={{ width: 38 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Experience summary */}
        <View style={styles.card}>
          {(exp.primary_image_url ?? exp.image_url) ? (
            <Image
              source={{ uri: (exp.primary_image_url ?? exp.image_url)! }}
              style={styles.cardImg}
              contentFit="cover"
            />
          ) : null}
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>{exp.title}</Text>
            <Text style={styles.cardMeta}>📍 {exp.location}</Text>
            {exp.event_date ? (
              <Text style={styles.cardMeta}>
                📅 {new Date(exp.event_date).toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' })}
                {exp.start_time ? `  🕐 ${exp.start_time.slice(0, 5)}` : ''}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.label}>Cantidad de personas</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
              onPress={() => { if (quantity > 1) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQuantity(q => q - 1); } }}
            >
              <Feather name="minus" size={18} color={quantity > 1 ? '#FFFFFF' : 'rgba(255,255,255,0.3)'} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity >= 10 && styles.qtyBtnDisabled]}
              onPress={() => { if (quantity < 10) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQuantity(q => q + 1); } }}
            >
              <Feather name="plus" size={18} color={quantity < 10 ? '#FFFFFF' : 'rgba(255,255,255,0.3)'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact info */}
        <View style={styles.section}>
          <Text style={styles.label}>Información de contacto</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre (opcional)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={guestName}
            onChangeText={setGuestName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono (opcional)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={guestPhone}
            onChangeText={setGuestPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Solicitudes especiales (opcional)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price summary */}
        <View style={styles.priceSummary}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Q{exp.price.toLocaleString()} × {quantity}
            </Text>
            <Text style={styles.priceValue}>Q{total.toLocaleString()}</Text>
          </View>
          {!isFree && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Comisión de plataforma</Text>
              <Text style={styles.priceValue}>Incluida</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.priceTotal]}>
            <Text style={styles.priceTotalLabel}>Total</Text>
            <Text style={styles.priceTotalValue}>
              {isFree ? 'Gratis' : `Q${total.toLocaleString()}`}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, busy && styles.ctaBtnDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.ctaText}>
                {isFree
                  ? 'Confirmar gratis'
                  : exp.booking_type === 'contact'
                  ? 'Solicitar reserva'
                  : `Pagar Q${total.toLocaleString()} con PayPal`}
              </Text>
              {!isFree && exp.booking_type === 'paid' && (
                <Feather name="external-link" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              )}
            </>
          )}
        </TouchableOpacity>
        {createBooking.isError && (
          <Text style={styles.errorText}>
            {(createBooking.error as Error)?.message ?? 'Error al crear la reserva'}
          </Text>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  content: { padding: Spacing.base },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    marginBottom: Spacing.lg,
  },
  cardImg: { width: '100%', height: 160 },
  cardBody: { padding: Spacing.base },
  cardTitle: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700', marginBottom: 6 },
  cardMeta: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm, marginTop: 2 },
  section: { marginBottom: Spacing.lg },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: '#1A1A1A',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyValue: { color: '#FFFFFF', fontSize: FontSize.xl, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: FontSize.base,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    marginBottom: Spacing.sm,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  priceSummary: {
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    gap: Spacing.sm,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
  priceValue: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
  priceTotal: { borderTopWidth: 0.5, borderTopColor: '#2A2A2A', paddingTop: Spacing.sm, marginTop: 2 },
  priceTotalLabel: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  priceTotalValue: { color: '#E8621A', fontSize: FontSize.base, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: '#1A1A1A',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  errorText: { color: Colors.error, fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm },
});
