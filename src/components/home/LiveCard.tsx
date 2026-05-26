/**
 * LiveCard — 260×340px horizontal carousel card.
 * Matches web TodayEventsCarousel LiveCard exactly.
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Experience } from '../../types';

const CARD_W = 260;
const CARD_H = 340;
const RADIUS = 20;

interface Props {
  experience: Experience;
  onPress: () => void;
  badge?: string | null;
}

const getTimingBadge = (exp: Experience): string | null => {
  if (!exp.event_date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(exp.event_date);
  eventDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((eventDate.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return null;
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays <= 7) return `En ${diffDays} días`;
  return null;
};

const formatPrice = (price: number, type: string): string | null => {
  if (type === 'free' || price === 0) return null;
  return `Q${price.toLocaleString()}`;
};

export const LiveCard: React.FC<Props> = ({ experience, onPress, badge: propBadge }) => {
  const badge = propBadge !== undefined ? propBadge : getTimingBadge(experience);
  const price = formatPrice(experience.price, experience.booking_type);
  const isLive = badge === 'Hoy';

  // Pulse animation for live dot (matches web `livepulse` keyframe)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isLive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isLive]);

  const metaLine = [
    experience.start_time?.slice(0, 5),
    experience.location,
  ].filter(Boolean).join(' · ');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.card}
    >
      {/* Full image */}
      <Image
        source={{ uri: (experience.primary_image_url ?? experience.image_url) ?? undefined }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />

      {/* Gradient overlay: transparent 30% → rgba(0,0,0,0.92) — exact web value */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.92)']}
        locations={[0.3, 1.0]}
        style={StyleSheet.absoluteFill}
      />

      {/* Timing badge — top-left */}
      {badge && (
        <View style={styles.timingBadge}>
          {isLive && (
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
          )}
          <Text style={styles.timingText}>{badge}</Text>
        </View>
      )}

      {/* Price badge — top-right */}
      {price && (
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{price}</Text>
        </View>
      )}

      {/* Bottom content — sits inside gradient */}
      <View style={styles.bottomContent}>
        {experience.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {experience.category.charAt(0).toUpperCase() + experience.category.slice(1)}
            </Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {experience.title}
        </Text>
        {metaLine.length > 0 && (
          <Text style={styles.meta} numberOfLines={1}>
            {metaLine}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: '#111111',
    flexShrink: 0,
  },

  // Timing badge: bg-[#E8621A]/75 backdrop-blur px-3 py-1.5 rounded-full
  timingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(232,98,26,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    // shadow mimics web's inset glow
    shadowColor: 'rgba(232,98,26,0.45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  timingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Price badge: bg-black/50 backdrop-blur px-2.5 py-1 rounded-full
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },

  // Bottom content: p-4
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  // title: text-[19px] font-bold text-white line-clamp-2 leading-tight
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  // meta: text-[12px] color rgba(255,255,255,0.65)
  meta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
});
