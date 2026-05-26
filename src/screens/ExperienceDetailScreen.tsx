import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius, Shadow } from '../constants/theme';
import { useExperienceDetail } from '../hooks/useExperiences';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';

type RouteParams = RouteProp<RootStackParamList, 'ExperienceDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.65;

const formatPrice = (price: number, type: string) => {
  if (type === 'free' || price === 0) return 'Gratis';
  return `Q${price.toLocaleString()}`;
};

export const ExperienceDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { id } = route.params;
  const { user } = useAuth();

  const { data: experience, isLoading, error } = useExperienceDetail(id);

  const [isSaved, setIsSaved] = useState(false);

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (error || !experience) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontró la experiencia</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBook = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!user) {
      navigation.navigate('Auth');
      return;
    }
    Alert.alert(
      'Solicitar reserva',
      `¿Quieres solicitar una reserva para "${experience.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => Alert.alert('¡Listo!', 'Tu solicitud fue enviada al anfitrión.'),
        },
      ],
    );
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSaved((v) => !v);
  };

  const handleHostPress = () => {
    if (experience.host_id) {
      navigation.navigate('HostPublic', { id: experience.host_id });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: experience.image_url ?? undefined }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          {/* Back + Save */}
          <SafeAreaView style={styles.imageOverlay} edges={['top']}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Text style={styles.iconButtonText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
              <Text style={styles.iconButtonText}>{isSaved ? '♥' : '♡'}</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {experience.category && (
            <Text style={styles.category}>{experience.category.toUpperCase()}</Text>
          )}
          <Text style={styles.title}>{experience.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📍 {experience.location}</Text>
            {experience.duration && (
              <Text style={styles.metaText}>⏱ {experience.duration}</Text>
            )}
            {experience.rating && (
              <Text style={styles.metaText}>⭐ {experience.rating.toFixed(1)}</Text>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio</Text>
            <Text style={styles.price}>
              {formatPrice(experience.price, experience.booking_type)}
            </Text>
          </View>

          {/* Description */}
          {(experience.description ?? experience.short_description) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>
                {experience.description ?? experience.short_description}
              </Text>
            </View>
          )}

          {/* Host */}
          {experience.host_id && (
            <TouchableOpacity style={styles.hostCard} onPress={handleHostPress}>
              <Text style={styles.hostLabel}>Anfitrión</Text>
              <Text style={styles.hostLink}>Ver perfil del anfitrión →</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA */}
      <SafeAreaView style={styles.ctaContainer} edges={['bottom']}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleBook} activeOpacity={0.85}>
          <Text style={styles.ctaText}>
            {experience.booking_type === 'free' ? 'Participar gratis' : 'Reservar ahora'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.backgroundCard,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.base,
  },
  category: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  priceLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  price: {
    color: Colors.primary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    lineHeight: 24,
  },
  hostCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 0.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  hostLink: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    ...Shadow.md,
  },
  ctaText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
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
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
