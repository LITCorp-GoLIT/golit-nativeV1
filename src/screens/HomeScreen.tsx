import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image as RNImage,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FontSize, Spacing } from '../constants/theme';
import { useExperiences, useFeaturedExperiences } from '../hooks/useExperiences';
import { ExperienceCard } from '../components/common/ExperienceCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TodayCarousel } from '../components/home/TodayCarousel';
import { RootStackParamList, Experience } from '../types';
import { useNavCollapse } from '../contexts/NavCollapseContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const golitLogo = require('../../assets/golit-logo-official.png');

// Mini-card dimensions (horizontal carousels)
const CARD_W = 160;
const CARD_H = 220;
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_W + CARD_GAP;

// Height of the header body (below safe area): logo + tagline + location
const HEADER_BODY_H = 96;

// Scroll hysteresis constants — exact copy of web Index.tsx
const COLLAPSE_THRESHOLD = 12;
const EXPAND_THRESHOLD = -8;
const TOP_RESET_Y = 40;
const MOUNT_GUARD_MS = 250;

// ─── Category chips ───────────────────────────────────────────────────────────
type ChipId =
  | 'today' | 'upcoming' | 'music' | 'comedy' | 'gastronomy'
  | 'cultural' | 'adventure' | 'nightlife' | 'sports' | 'wellness';

interface Chip { id: ChipId; label: string; icon: string; }

const CHIPS: Chip[] = [
  { id: 'today',      label: `${new Date().getDate()} Hoy`, icon: 'calendar' },
  { id: 'upcoming',   label: 'Próximamente',                icon: 'clock'    },
  { id: 'music',      label: 'Música',                      icon: 'music'    },
  { id: 'comedy',     label: 'Comedia',                     icon: 'smile'    },
  { id: 'gastronomy', label: 'Gastronomía',                 icon: 'coffee'   },
  { id: 'cultural',   label: 'Cultura',                     icon: 'flag'     },
  { id: 'adventure',  label: 'Expediciones',                icon: 'compass'  },
  { id: 'nightlife',  label: 'Nightlife',                   icon: 'moon'     },
  { id: 'sports',     label: 'Deportes',                    icon: 'award'    },
  { id: 'wellness',   label: 'Wellness',                    icon: 'heart'    },
];

const CATEGORY_MAP: Partial<Record<ChipId, string[]>> = {
  music:      ['musica', 'music', 'concierto', 'festival'],
  comedy:     ['comedia', 'comedy', 'humor'],
  gastronomy: ['gastronomia', 'gastronomy', 'restaurante', 'food', 'brunch'],
  cultural:   ['cultura', 'cultural', 'arte', 'art', 'museo'],
  adventure:  ['aventura', 'adventure', 'expedicion', 'hiking'],
  nightlife:  ['nightlife', 'vida nocturna', 'bar', 'fiesta'],
  sports:     ['deportes', 'sports', 'fitness'],
  wellness:   ['wellness', 'bienestar', 'yoga', 'meditacion'],
};

// ─── Mini carousel card (160×220px) ──────────────────────────────────────────
const CarouselCard: React.FC<{ exp: Experience; onPress: () => void }> = ({ exp, onPress }) => {
  const hasPrice = exp.booking_type !== 'free' && exp.price > 0;
  const priceLabel = hasPrice ? `Q${exp.price.toLocaleString()}` : 'Gratis';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={cardSt.card}>
      {/* Full image */}
      <Image
        source={{ uri: (exp.primary_image_url ?? exp.image_url) ?? undefined }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.88)']}
        locations={[0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Category badge — top-left */}
      {exp.category ? (
        <View style={cardSt.catBadge}>
          <Text style={cardSt.catText}>
            {exp.category.charAt(0).toUpperCase() + exp.category.slice(1)}
          </Text>
        </View>
      ) : null}
      {/* Bottom text */}
      <View style={cardSt.bottom}>
        <Text style={cardSt.title} numberOfLines={2}>{exp.title}</Text>
        <Text style={cardSt.price}>{priceLabel}</Text>
      </View>
    </TouchableOpacity>
  );
};

const cardSt = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#111111',
    flexShrink: 0,
  },
  catBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 3,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  price: {
    // Exact web value: text-[12px] text-[#E8621A] font-bold
    color: '#E8621A',
    fontSize: 12,
    fontWeight: '700',
  },
});

// ─── Section row header ───────────────────────────────────────────────────────
const SectionRow: React.FC<{ title: string; onSeeAll?: () => void }> = ({ title, onSeeAll }) => (
  <View style={rowSt.row}>
    <Text style={rowSt.title}>{title}</Text>
    {onSeeAll ? (
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} style={rowSt.btn}>
        <Text style={rowSt.btnText}>Ver todo</Text>
        <Feather name="chevron-right" size={14} color="#E8621A" />
      </TouchableOpacity>
    ) : null}
  </View>
);

const rowSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  btnText: {
    color: '#E8621A',
    fontSize: 13,
    fontWeight: '500',
  },
});

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { setCollapsed } = useNavCollapse();
  const insets = useSafeAreaInsets();

  const [activeChip, setActiveChip] = useState<ChipId>('today');
  const [refreshing, setRefreshing] = useState(false);

  // scrollY drives the header animation natively (no JS bridge jank)
  const scrollY = useRef(new Animated.Value(0)).current;

  // Refs for the NavCollapse hysteresis (JS-thread listener)
  const lastYRef   = useRef(0);
  const accumRef   = useRef(0);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    setCollapsed(false);
    mountTimeRef.current = Date.now();
    lastYRef.current   = 0;
    accumRef.current   = 0;
  }, []);

  // Header animations — runs on native thread, smooth 60fps
  const HEADER_TOTAL_H = insets.top + HEADER_BODY_H;

  const headerTranslateY = scrollY.interpolate({
    inputRange:  [0, HEADER_BODY_H],
    outputRange: [0, -HEADER_TOTAL_H],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange:  [0, HEADER_BODY_H * 0.55],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // NavCollapse listener (called on JS thread via Animated.event's listener option)
  const navCollapseListener = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      if (Date.now() - mountTimeRef.current < MOUNT_GUARD_MS) return;

      const delta = y - lastYRef.current;
      lastYRef.current = y;

      if (y < TOP_RESET_Y) {
        accumRef.current = 0;
        setCollapsed(false);
        return;
      }

      if ((delta > 0 && accumRef.current < 0) || (delta < 0 && accumRef.current > 0)) {
        accumRef.current = 0;
      }
      accumRef.current += delta;

      if (accumRef.current > COLLAPSE_THRESHOLD) {
        setCollapsed(true);
        accumRef.current = 0;
      } else if (accumRef.current < EXPAND_THRESHOLD) {
        setCollapsed(false);
        accumRef.current = 0;
      }
    },
    [setCollapsed],
  );

  // Combined handler: native-thread animation + JS-thread NavCollapse
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true, listener: navCollapseListener },
  );

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: featured = [], refetch: refetchFeatured } = useFeaturedExperiences();
  const { data: allExperiences = [], isLoading, refetch } = useExperiences();

  // "Para ti" = featured experiences
  const paraTi = useMemo(() => featured.slice(0, 12), [featured]);

  // "Tendencias" = non-featured sorted descending (Supabase already sorts by created_at desc)
  const tendencias = useMemo(() => {
    const featuredIds = new Set(featured.map((e) => e.id));
    return allExperiences.filter((e) => !featuredIds.has(e.id)).slice(0, 12);
  }, [allExperiences, featured]);

  // "Cerca de ti" = next slice, giving distinct content from Tendencias
  const cercaDeTi = useMemo(() => {
    const featuredIds = new Set(featured.map((e) => e.id));
    return allExperiences.filter((e) => !featuredIds.has(e.id)).slice(12, 24);
  }, [allExperiences, featured]);

  // TodayCarousel: events for today, fallback to first 8
  const todayItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = allExperiences.filter((exp) => {
      if (!exp.event_date) return false;
      const d = new Date(exp.event_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    return events.length > 0 ? events : allExperiences.slice(0, 8);
  }, [allExperiences]);

  // Trending 2-col grid (featured first, then rest filtered by chip)
  const gridItems = useMemo(() => {
    if (activeChip !== 'today' && activeChip !== 'upcoming') {
      const aliases = CATEGORY_MAP[activeChip];
      if (aliases) {
        return allExperiences.filter((exp) => {
          const cat = (exp.category ?? '').toLowerCase();
          return aliases.some((a) => cat.includes(a));
        });
      }
    }
    const featuredIds = new Set(featured.map((e) => e.id));
    return [...featured, ...allExperiences.filter((e) => !featuredIds.has(e.id))];
  }, [allExperiences, featured, activeChip]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchFeatured()]);
    setRefreshing(false);
  }, [refetch, refetchFeatured]);

  const handlePress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ExperienceDetail', { id });
  }, [navigation]);

  const handleChip = (id: ChipId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveChip(id);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* ── Animated header (absolute, slides up on scroll) ─────────────── */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            height: HEADER_TOTAL_H,
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
        pointerEvents="box-none"
      >
        <RNImage source={golitLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>Encuentra tu siguiente plan</Text>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={13} color="#E8621A" />
          <Text style={styles.locationText}>Antigua & Zona 4, Guatemala</Text>
        </View>
      </Animated.View>

      {/* ── Main scrollable feed ─────────────────────────────────────────── */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: HEADER_TOTAL_H }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            progressViewOffset={HEADER_TOTAL_H}
          />
        }
      >
        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
          style={styles.chips}
        >
          {CHIPS.map((chip) => {
            const isActive = activeChip === chip.id;
            const isToday  = chip.id === 'today';
            return (
              <TouchableOpacity
                key={chip.id}
                onPress={() => handleChip(chip.id)}
                activeOpacity={0.75}
                style={[
                  styles.chip,
                  isToday              && styles.chipToday,
                  isActive && !isToday && styles.chipActive,
                  !isActive && !isToday && styles.chipInactive,
                ]}
              >
                <Feather
                  name={chip.icon as any}
                  size={14}
                  color={isActive || isToday ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
                />
                <Text style={[styles.chipText, (isActive || isToday) && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Today LiveCards carousel (260×340) */}
        <TodayCarousel data={todayItems} onCardPress={handlePress} />

        {/* "Para ti" carousel — featured experiences */}
        {paraTi.length > 0 && (
          <View style={styles.section}>
            <SectionRow title="Para ti" />
            <FlatList
              data={paraTi}
              keyExtractor={(e) => `parati-${e.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              renderItem={({ item }) => (
                <CarouselCard exp={item} onPress={() => handlePress(item.id)} />
              )}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            />
          </View>
        )}

        {/* "Cerca de ti" carousel */}
        {cercaDeTi.length > 0 && (
          <View style={styles.section}>
            <SectionRow title="Cerca de ti" />
            <FlatList
              data={cercaDeTi}
              keyExtractor={(e) => `cerca-${e.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              renderItem={({ item }) => (
                <CarouselCard exp={item} onPress={() => handlePress(item.id)} />
              )}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            />
          </View>
        )}

        {/* "Tendencias" carousel */}
        {tendencias.length > 0 && (
          <View style={styles.section}>
            <SectionRow title="Tendencias" />
            <FlatList
              data={tendencias}
              keyExtractor={(e) => `tend-${e.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              renderItem={({ item }) => (
                <CarouselCard exp={item} onPress={() => handlePress(item.id)} />
              )}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            />
          </View>
        )}

        {/* Trending 2-col grid */}
        <View style={styles.section}>
          <SectionRow
            title={
              activeChip === 'today'
                ? 'Trending'
                : CHIPS.find((c) => c.id === activeChip)?.label ?? 'Planes'
            }
          />
          {isLoading ? (
            <LoadingSpinner />
          ) : gridItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="star" size={28} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Aún no hay planes</Text>
              <Text style={styles.emptySubtitle}>Estamos preparando opciones para ti</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {gridItems.map((item, index) => (
                <ExperienceCard
                  key={item.id}
                  experience={item}
                  onPress={() => handlePress(item.id)}
                  rank={activeChip === 'today' && index < 6 ? index + 1 : undefined}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Fixed header — sits above the ScrollView, slides away on scroll
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.base,
    paddingBottom: 10,
  },
  logo: {
    width: 126,
    height: 40,
    marginBottom: 4,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    color: '#E8621A',
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  chips: {
    marginBottom: 16,
  },
  chipsContent: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 100,
  },
  chipToday: {
    backgroundColor: '#E8621A',
    shadowColor: '#E8621A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  chipActive: {
    backgroundColor: '#3A3A3A',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipInactive: {
    backgroundColor: '#1A1A1A',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  chipText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  grid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
