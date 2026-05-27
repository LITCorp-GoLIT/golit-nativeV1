import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';

// Step 1: What are you looking for?
const INTENTIONS = [
  { id: 'explorer', label: 'Explorar planes', icon: 'compass' },
  { id: 'social', label: 'Planes con amigos', icon: 'users' },
  { id: 'romantic', label: 'Salidas en pareja', icon: 'heart' },
  { id: 'family', label: 'Planes en familia', icon: 'home' },
  { id: 'business', label: 'Eventos de negocio', icon: 'briefcase' },
  { id: 'adventure', label: 'Aventura y naturaleza', icon: 'sun' },
];

// Step 2: What categories do you like?
const INTERESTS = [
  { id: 'music', label: 'Música', icon: 'music' },
  { id: 'gastronomy', label: 'Gastronomía', icon: 'coffee' },
  { id: 'cultural', label: 'Cultural', icon: 'book-open' },
  { id: 'adventure', label: 'Aventura', icon: 'compass' },
  { id: 'nightlife', label: 'Nightlife', icon: 'moon' },
  { id: 'sports', label: 'Deportes', icon: 'activity' },
  { id: 'wellness', label: 'Wellness', icon: 'heart' },
  { id: 'comedy', label: 'Comedia', icon: 'smile' },
];

export const OnboardingScreen: React.FC = () => {
  const { setOnboardingCompleted } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 1) {
      if (!selectedIntention) return;
      setStep(2);
    } else {
      setOnboardingCompleted(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}
      <View style={styles.progress}>
        <View style={[styles.bar, step >= 1 && styles.barActive]} />
        <View style={[styles.bar, step >= 2 && styles.barActive]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>¿Qué buscas?</Text>
            <Text style={styles.subtitle}>Te ayudamos a encontrar los mejores planes</Text>
            <View style={styles.grid}>
              {INTENTIONS.map((item) => {
                const active = selectedIntention === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedIntention(item.id);
                    }}
                    activeOpacity={0.75}
                  >
                    <Feather
                      name={item.icon as any}
                      size={20}
                      color={active ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
                    />
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>¿Qué te gusta?</Text>
            <Text style={styles.subtitle}>Elige tus categorías favoritas (puedes elegir varias)</Text>
            <View style={styles.grid}>
              {INTERESTS.map((item) => {
                const active = selectedInterests.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInterest(item.id)}
                    activeOpacity={0.75}
                  >
                    <Feather
                      name={item.icon as any}
                      size={20}
                      color={active ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
                    />
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            (step === 1 && !selectedIntention) && styles.nextBtnDisabled,
          ]}
          onPress={goNext}
          activeOpacity={0.85}
          disabled={step === 1 && !selectedIntention}
        >
          <Text style={styles.nextBtnText}>
            {step === 1 ? 'Siguiente' : 'Empezar'}
          </Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progress: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#2A2A2A',
  },
  barActive: { backgroundColor: '#E8621A' },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 100,
  },
  title: {
    color: '#FFFFFF',
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  chipActive: {
    backgroundColor: '#E8621A',
    borderColor: '#E8621A',
    shadowColor: '#E8621A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  chipLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  chipLabelActive: { color: '#FFFFFF' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: '#1A1A1A',
  },
  nextBtn: {
    backgroundColor: '#E8621A',
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
});
