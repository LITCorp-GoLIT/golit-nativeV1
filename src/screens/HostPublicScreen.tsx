import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius, Shadow } from '../constants/theme';
import { useHostPublic, formatHostBusinessType } from '../hooks/useHostPublic';
import { ExperienceCard } from '../components/common/ExperienceCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RootStackParamList } from '../types';

type RouteParams = RouteProp<RootStackParamList, 'HostPublic'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_HEIGHT = SCREEN_WIDTH * 0.55;
const AVATAR_SIZE = 80;

const waNumber = (v: string) => v.replace(/[^\d]/g, '');
const igUrl = (v: string) =>
  v.includes('instagram.com') ? v : `https://instagram.com/${v.replace(/^@/, '')}`;

export const HostPublicScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { id } = route.params;

  const { data, isLoading, error } = useHostPublic(id);

  const host = data?.host;
  const experiences = data?.experiences ?? [];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${host?.business_name ?? 'Negocio'} en Golit`,
        url: `https://golit.io/host/${id}`,
      });
    } catch {
      /* cancelled */
    }
  };

  const handleExperiencePress = (expId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ExperienceDetail', { id: expId });
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (error || !host) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontró el anfitrión</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverContainer}>
          {host.cover_image_url ? (
            <Image
              source={{ uri: host.cover_image_url }}
              style={styles.cover}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]} />
          )}
          <SafeAreaView style={styles.coverOverlay} edges={['top']}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.iconBtnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Text style={styles.iconBtnText}>↑</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Profile section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {host.logo_url ? (
              <Image
                source={{ uri: host.logo_url }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {(host.business_name ?? 'H')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{host.business_name ?? 'Sin nombre'}</Text>
              {host.is_verified && (
                <Text style={styles.verified}> ✓</Text>
              )}
            </View>
            {host.business_type && (
              <Text style={styles.type}>{formatHostBusinessType(host.business_type)}</Text>
            )}
            {(host.city ?? host.country) && (
              <Text style={styles.location}>
                📍 {[host.city, host.country].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{host.total_experiences ?? experiences.length}</Text>
              <Text style={styles.statLabel}>Experiencias</Text>
            </View>
            {host.rating && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>⭐ {host.rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>
                  {host.total_reviews ? `${host.total_reviews} reseñas` : 'Sin reseñas'}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {host.description && (
            <Text style={styles.description}>{host.description}</Text>
          )}

          {/* Social links */}
          <View style={styles.socialRow}>
            {host.whatsapp && (
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => Linking.openURL(`https://wa.me/${waNumber(host.whatsapp!)}`)}
              >
                <Text style={styles.socialBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {host.instagram && (
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => Linking.openURL(igUrl(host.instagram!))}
              >
                <Text style={styles.socialBtnText}>Instagram</Text>
              </TouchableOpacity>
            )}
            {host.website && (
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => Linking.openURL(host.website!.startsWith('http') ? host.website! : `https://${host.website}`)}
              >
                <Text style={styles.socialBtnText}>Web</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Experiences */}
        {experiences.length > 0 && (
          <View style={styles.experiencesSection}>
            <Text style={styles.experiencesTitle}>Experiencias</Text>
            <FlatList
              horizontal
              data={experiences}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ExperienceCard
                  experience={item}
                  onPress={() => handleExperiencePress(item.id)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.experiencesList}
            />
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  coverContainer: {
    width: SCREEN_WIDTH,
    height: COVER_HEIGHT,
    backgroundColor: Colors.backgroundCard,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: Colors.surface,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  profileSection: {
    padding: Spacing.base,
    paddingTop: 0,
    marginTop: -AVATAR_SIZE / 2,
  },
  avatarWrapper: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  profileInfo: {
    marginBottom: Spacing.base,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  verified: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  type: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  location: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.base,
  },
  stat: {
    alignItems: 'flex-start',
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.base,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  socialBtn: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  socialBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  experiencesSection: {
    marginBottom: Spacing.base,
  },
  experiencesTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  experiencesList: {
    paddingHorizontal: Spacing.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    marginBottom: Spacing.base,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backBtnText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
