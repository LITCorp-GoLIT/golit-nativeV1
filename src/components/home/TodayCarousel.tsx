/**
 * TodayCarousel — Horizontal snap carousel of 260×340 LiveCards.
 * Matches web TodayEventsCarousel layout exactly.
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Experience } from '../../types';
import { LiveCard } from './LiveCard';

const CARD_W = 260;
const GAP = 12;
const SNAP_INTERVAL = CARD_W + GAP;

interface Props {
  data: Experience[];
  onCardPress: (id: string) => void;
  onSeeAll?: () => void;
}

const LiveDot: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />;
};

export const TodayCarousel: React.FC<Props> = ({ data, onCardPress, onSeeAll }) => {
  if (data.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* Section header — px-5, title 17px semibold, "Ver todo" #E8621A 12px */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LiveDot />
          <Text style={styles.title}>Hoy</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal FlatList with snap — paddingLeft:20, gap:12 */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <LiveCard
            experience={item}
            onPress={() => onCardPress(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Live dot: w-[7px] h-[7px] bg-[#FF3B3B] rounded-full
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF3B3B',
  },
  // Title: text-[17px] font-semibold text-white
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  seeAllBtn: {
    paddingVertical: 4,
  },
  // "Ver todo": text-[12px] text-[#E8621A] font-medium
  seeAllText: {
    color: '#E8621A',
    fontSize: 12,
    fontWeight: '500',
  },
  // paddingLeft:20, paddingRight:8 — matching web scrollPaddingLeft:20
  listContent: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 4,
  },
});
