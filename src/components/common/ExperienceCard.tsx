/**
 * PlanCard — mirrors the web PlanCard design exactly.
 * 3:4 portrait, image 65% top, info panel 35% bottom on #1A1A1A.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../constants/colors';
import { FontSize, Radius } from '../../constants/theme';
import { Experience } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 2-column grid with 16px padding each side + 10px gap between
export const CARD_WIDTH = (SCREEN_WIDTH - 32 - 10) / 2;
export const CARD_HEIGHT = CARD_WIDTH * (4 / 3); // 3:4 aspect

const formatPrice = (price: number, type: string): string | undefined => {
  if (type === 'free' || price === 0) return undefined;
  return `Q${price.toLocaleString()}`;
};

const getTimingBadge = (exp: Experience): string | null => {
  if (!exp.event_date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(exp.event_date);
  eventDate.setHours(0, 0, 0, 0);
  const diffMs = eventDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays <= 7) return `En ${diffDays} días`;
  return null;
};

interface Props {
  experience: Experience;
  onPress: () => void;
  width?: number;
  rank?: number;
}

export const ExperienceCard: React.FC<Props> = ({
  experience,
  onPress,
  width = CARD_WIDTH,
  rank,
}) => {
  const height = width * (4 / 3);
  const imageHeight = height * 0.65;
  const infoHeight = height * 0.35;
  const badge = getTimingBadge(experience);
  const price = formatPrice(experience.price, experience.booking_type);

  const metaLine = [
    experience.start_time?.slice(0, 5),
    experience.location,
  ]
    .filter(Boolean)
    .join(' · ') + (price ? ` · ${price}` : '');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { width, height, borderRadius: Radius.xl }]}
    >
      {/* Image area — 65% */}
      <View style={[styles.imageArea, { height: imageHeight }]}>
        <Image
          source={{ uri: (experience.primary_image_url ?? experience.image_url) ?? undefined }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />

        {/* Timing badge — top-left, liquid glass orange */}
        {badge && (
          <View style={styles.badge}>
            {(badge === 'Hoy' || badge.startsWith('Empieza')) && (
              <View style={styles.badgePulse} />
            )}
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        {/* Rank — top-right */}
        {rank !== undefined && (
          <View style={styles.rank}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
        )}
      </View>

      {/* Info panel — 35% on #1A1A1A */}
      <View style={[styles.infoPanel, { height: infoHeight }]}>
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
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  imageArea: {
    width: '100%',
    backgroundColor: '#111111',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(232,98,26,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: 'rgba(232,98,26,0.45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  badgePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  rank: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  rankText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  infoPanel: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    gap: 3,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  meta: {
    color: '#888888',
    fontSize: 11,
    lineHeight: 14,
  },
});
