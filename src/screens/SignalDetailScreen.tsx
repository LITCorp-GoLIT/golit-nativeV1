import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSignalDetail } from '../hooks/useSignalDetail';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { RootStackParamList } from '../types';

type RouteParams = RouteProp<RootStackParamList, 'SignalDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const SIGNAL_TYPE_ICON: Record<string, string> = {
  concert: 'music',
  food: 'coffee',
  art: 'book-open',
  sport: 'activity',
  nightlife: 'moon',
  outdoor: 'compass',
};

const StarRow: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (!rating) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map((i) => (
        <Feather
          key={i}
          name="star"
          size={12}
          color={i <= Math.round(rating) ? '#F59E0B' : 'rgba(255,255,255,0.2)'}
        />
      ))}
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginLeft: 4 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
};

export const SignalDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { id } = route.params;
  const { user } = useAuth();

  const { data: signal, isLoading } = useSignalDetail(id);

  if (isLoading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#E8621A" size="large" />
      </View>
    );
  }

  if (!signal) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.textSecondary }}>Señal no encontrada</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: '#E8621A' }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const icon = SIGNAL_TYPE_ICON[signal.signal_type ?? ''] ?? 'zap';
  const biz = signal.businesses;

  const formatTime = (t: string | null) =>
    t ? t.slice(0, 5) : null;

  const handleContact = () => {
    if (!user) { navigation.navigate('Auth'); return; }
    if (biz?.id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Navigate to chat if host_id available, otherwise show phone
      if (biz.phone) {
        Linking.openURL(`tel:${biz.phone}`);
      }
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{signal.title}</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.iconBadge}>
            <Feather name={icon as any} size={32} color="#E8621A" />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.signalTitle}>{signal.title}</Text>
            {signal.category && (
              <Text style={styles.categoryTag}>{signal.category.toUpperCase()}</Text>
            )}
            {(formatTime(signal.start_time) || formatTime(signal.end_time)) && (
              <View style={styles.timeRow}>
                <Feather name="clock" size={13} color="rgba(255,255,255,0.4)" />
                <Text style={styles.timeText}>
                  {[formatTime(signal.start_time), formatTime(signal.end_time)].filter(Boolean).join(' – ')}
                </Text>
              </View>
            )}
            {signal.venue_name && (
              <View style={styles.timeRow}>
                <Feather name="map-pin" size={13} color="#E8621A" />
                <Text style={[styles.timeText, { color: '#E8621A' }]}>{signal.venue_name}</Text>
              </View>
            )}
            {signal.popularity_score != null && (
              <View style={styles.timeRow}>
                <Feather name="trending-up" size={13} color="rgba(255,255,255,0.4)" />
                <Text style={styles.timeText}>
                  Popularidad: {Math.round(signal.popularity_score * 100)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Business info */}
        {biz && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lugar</Text>
            <View style={styles.bizCard}>
              <View style={styles.bizRow}>
                <Text style={styles.bizName}>{biz.name ?? 'Sin nombre'}</Text>
                {biz.type && (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{biz.type}</Text>
                  </View>
                )}
              </View>
              <StarRow rating={biz.rating} />
              {biz.description && (
                <Text style={styles.bizDesc} numberOfLines={3}>{biz.description}</Text>
              )}
              {biz.address && (
                <View style={styles.metaRow}>
                  <Feather name="map-pin" size={13} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.metaText}>{biz.address}</Text>
                </View>
              )}
              {biz.phone && (
                <TouchableOpacity
                  style={styles.metaRow}
                  onPress={() => Linking.openURL(`tel:${biz.phone}`)}
                >
                  <Feather name="phone" size={13} color="#E8621A" />
                  <Text style={[styles.metaText, { color: '#E8621A' }]}>{biz.phone}</Text>
                </TouchableOpacity>
              )}
              {biz.website && (
                <TouchableOpacity
                  style={styles.metaRow}
                  onPress={() => Linking.openURL(biz.website!)}
                >
                  <Feather name="globe" size={13} color="#E8621A" />
                  <Text style={[styles.metaText, { color: '#E8621A' }]} numberOfLines={1}>
                    {biz.website.replace(/^https?:\/\//, '')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.ctaBtn} onPress={handleContact} activeOpacity={0.85}>
          <Feather name="message-circle" size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>
            {biz?.phone ? 'Llamar al lugar' : 'Contactar'}
          </Text>
        </TouchableOpacity>
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '700', flex: 1, textAlign: 'center' },
  heroCard: {
    margin: Spacing.base,
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    flexDirection: 'row',
    gap: Spacing.base,
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#E8621A1A', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E8621A33',
  },
  heroInfo: { flex: 1, gap: 6 },
  signalTitle: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700', lineHeight: 22 },
  categoryTag: { color: '#E8621A', fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  sectionTitle: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.sm },
  bizCard: {
    backgroundColor: '#1A1A1A', borderRadius: Radius.lg,
    padding: Spacing.base, borderWidth: 0.5, borderColor: '#2A2A2A', gap: 8,
  },
  bizRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bizName: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700', flex: 1 },
  typeBadge: {
    backgroundColor: '#E8621A22', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  typeBadgeText: { color: '#E8621A', fontSize: FontSize.xs, fontWeight: '600' },
  bizDesc: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background, borderTopWidth: 0.5, borderTopColor: '#1A1A1A',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md,
  },
  ctaBtn: {
    backgroundColor: '#E8621A', borderRadius: Radius.lg, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
});
