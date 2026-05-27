import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAllExperiences, useUpcomingEvents } from '../hooks/useExperiences';
import { useSignals } from '../hooks/useSignals';
import { useScrollCollapse } from '../hooks/useScrollCollapse';
import { HeroHeader } from '../components/home/HeroHeader';
import { CategoryPills, ChipId } from '../components/home/CategoryPills';
import { ExperienceCard } from '../components/common/ExperienceCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RootStackParamList, Experience, Signal } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_MAP: Partial<Record<ChipId, string[]>> = {
  music:      ['musica', 'music', 'concierto', 'festival'],
  comedy:     ['comedia', 'comedy', 'humor'],
  gastronomy: ['gastronomia', 'gastronomy', 'restaurante', 'food', 'brunch', 'culinary'],
  cultural:   ['cultura', 'cultural', 'arte', 'art', 'museo'],
  adventure:  ['aventura', 'adventure', 'expedicion', 'hiking', 'extreme_adventure'],
  nightlife:  ['nightlife', 'vida nocturna', 'bar', 'bars', 'fiesta'],
  sports:     ['deportes', 'sports', 'fitness', 'extreme'],
  wellness:   ['wellness', 'bienestar', 'yoga', 'meditacion'],
};

const SectionRow: React.FC<{ title: string; icon?: string }> = ({ title, icon }) => (
  <View style={rowSt.row}>
    {icon ? <Feather name={icon as any} size={16} color="#E8621A" style={{ marginRight: 6 }} /> : null}
    <Text style={rowSt.title}>{title}</Text>
  </View>
);
const rowSt = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
});

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { onScroll } = useScrollCollapse();

  const [activeChip, setActiveChip] = useState<ChipId>('today');
  const [refreshing, setRefreshing] = useState(false);

  const { data: all = [], isLoading, refetch } = useAllExperiences();
  const { data: signals = [] } = useSignals();
  const { data: upcoming = [] } = useUpcomingEvents();

  const todayItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = all.filter((exp) => {
      if (!exp.event_date) return false;
      const d = new Date(exp.event_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    return (events.length > 0 ? events : all.slice(0, 8)).slice(0, 6);
  }, [all]);

  const trending = useMemo(() => all.slice(0, 6), [all]);

  const gridItems = useMemo(() => {
    if (activeChip === 'today' || activeChip === 'upcoming') return all;
    const aliases = CATEGORY_MAP[activeChip];
    if (!aliases) return all;
    const aliasSet = new Set(aliases);
    return all.filter((exp) => {
      const cat = (exp.category ?? '').toLowerCase();
      const expCat = ((exp as any).experience_category ?? '').toLowerCase();
      return aliasSet.has(cat) || aliasSet.has(expCat) ||
        aliases.some((a) => cat.includes(a) || expCat.includes(a));
    });
  }, [all, activeChip]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ExperienceDetail', { id });
  }, [navigation]);

  const handleChip = useCallback((id: ChipId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveChip(id);
  }, []);

  const gridTitle =
    activeChip === 'today'    ? 'Todos los planes' :
    activeChip === 'upcoming' ? 'Próximamente' :
    activeChip.charAt(0).toUpperCase() + activeChip.slice(1);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <HeroHeader />
      </View>

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E8621A"
          />
        }
      >
        {/* Señales */}
        {signals.length > 0 && (
          <View style={styles.section}>
            <SectionRow title="Señales" icon="zap" />
            <FlatList
              horizontal
              data={signals}
              keyExtractor={(s) => s.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.signalCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('SignalDetail', { id: item.id });
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.signalImg, styles.signalImgFallback]}>
                    <Feather name="zap" size={20} color="#E8621A" />
                  </View>
                  <Text style={styles.signalTitle} numberOfLines={2}>{item.title}</Text>
                  {item.venue_name ? (
                    <Text style={styles.signalLoc} numberOfLines={1}>{item.venue_name}</Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <CategoryPills activeChip={activeChip} onSelect={handleChip} />

        {/* Hoy */}
        <View style={styles.section}>
          <SectionRow title="Hoy" />
          <View style={styles.grid}>
            {todayItems.map((item) => (
              <ExperienceCard
                key={item.id}
                experience={item}
                onPress={() => handlePress(item.id)}
              />
            ))}
          </View>
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <SectionRow title="Trending" icon="trending-up" />
          <View style={styles.grid}>
            {trending.map((item, i) => (
              <ExperienceCard
                key={item.id}
                experience={item}
                onPress={() => handlePress(item.id)}
                rank={i + 1}
              />
            ))}
          </View>
        </View>

        {/* Próximamente */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <SectionRow title="Próximamente" icon="clock" />
            <FlatList
              horizontal
              data={upcoming}
              keyExtractor={(e) => e.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.upcomingCard}
                  onPress={() => handlePress(item.id)}
                  activeOpacity={0.8}
                >
                  {item.primary_image_url ? (
                    <Image source={{ uri: item.primary_image_url }} style={styles.upcomingImg} />
                  ) : (
                    <View style={[styles.upcomingImg, styles.upcomingImgFallback]}>
                      <Feather name="calendar" size={20} color="rgba(255,255,255,0.25)" />
                    </View>
                  )}
                  <View style={styles.upcomingInfo}>
                    <Text style={styles.upcomingTitle} numberOfLines={2}>{item.title}</Text>
                    {item.event_date ? (
                      <Text style={styles.upcomingDate}>
                        {new Date(item.event_date).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Main grid filtered by chip */}
        <View style={styles.section}>
          <SectionRow title={gridTitle} />
          {isLoading ? (
            <LoadingSpinner />
          ) : gridItems.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="star" size={28} color="rgba(255,255,255,0.25)" />
              <Text style={styles.emptyTitle}>Aún no hay planes</Text>
              <Text style={styles.emptySub}>Estamos preparando opciones para ti</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {gridItems.map((item) => (
                <ExperienceCard
                  key={item.id}
                  experience={item}
                  onPress={() => handlePress(item.id)}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  scroll: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  grid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    textAlign: 'center',
  },
  hScroll: { paddingLeft: 20, paddingRight: 8, gap: 10 },
  signalCard: {
    width: 140,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
  },
  signalImg: { width: 140, height: 90 },
  signalImgFallback: {
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  signalLoc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  upcomingCard: {
    width: 160,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
  },
  upcomingImg: { width: 160, height: 100 },
  upcomingImgFallback: {
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingInfo: { padding: 10 },
  upcomingTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  upcomingDate: {
    color: '#E8621A',
    fontSize: 11,
    fontWeight: '600',
  },
});
