import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { RootStackParamList } from '../types';

type RouteParams = RouteProp<RootStackParamList, 'OrderConfirmation'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export const OrderConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { bookingId, experienceTitle } = route.params;

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 14 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated checkmark */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
          <Feather name="check" size={40} color="#FFFFFF" />
        </Animated.View>

        <Animated.View style={{ opacity }}>
          <Text style={styles.title}>¡Reserva confirmada!</Text>
          <Text style={styles.subtitle}>{experienceTitle}</Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Feather name="hash" size={14} color="rgba(255,255,255,0.4)" />
              <Text style={styles.infoLabel}>Número de reserva</Text>
            </View>
            <Text style={styles.infoValue}>{bookingId.slice(0, 8).toUpperCase()}</Text>
          </View>

          <Text style={styles.note}>
            Recibirás una confirmación en tu email con todos los detalles.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('MyBookings')}
          activeOpacity={0.75}
        >
          <Feather name="list" size={16} color="#E8621A" />
          <Text style={styles.secondaryBtnText}>Ver mis reservas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={goHome} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Explorar más planes</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8621A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#E8621A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  infoBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoLabel: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.xs },
  infoValue: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700', fontVariant: ['tabular-nums'] },
  note: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg, gap: Spacing.sm },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8621A',
  },
  secondaryBtnText: { color: '#E8621A', fontSize: FontSize.base, fontWeight: '600' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8621A',
    borderRadius: Radius.lg,
    paddingVertical: 15,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
});
