import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSubmitHostApplication } from '../hooks/useHostStatus';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BUSINESS_TYPES = [
  { id: 'individual', label: 'Individual / Freelance', icon: 'user' },
  { id: 'company',    label: 'Empresa / Negocio',      icon: 'briefcase' },
  { id: 'organization', label: 'Organización / ONG',   icon: 'users' },
] as const;

const EXPERIENCE_TYPES = [
  'Gastronomía', 'Música', 'Arte & Cultura', 'Deportes', 'Aventura',
  'Bienestar', 'Nightlife', 'Educación', 'Turismo', 'Otro',
];

export const BecomeHostScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const submitApplication = useSubmitHostApplication();

  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState<'individual' | 'company' | 'organization' | ''>('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [experienceDescription, setExperienceDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Guatemala');
  const [country, setCountry] = useState('Guatemala');
  const [instagram, setInstagram] = useState('');

  const toggleType = (t: string) =>
    setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const canNext = () => {
    if (step === 1) return !!businessType && businessName.trim().length > 2 && phone.trim().length > 7;
    if (step === 2) return description.trim().length > 20 && experienceDescription.trim().length > 20 && selectedTypes.length > 0;
    return address.trim().length > 4;
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < 3) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      await submitApplication.mutateAsync({
        businessName, businessType: businessType as any,
        description, experienceDescription,
        experienceType: selectedTypes, phone, address, city, country,
        instagram: instagram.trim() || undefined,
      });
      Alert.alert(
        '¡Solicitud enviada!',
        'Revisaremos tu solicitud y te contactaremos en 2-3 días hábiles.',
        [{ text: 'Entendido', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo enviar la solicitud');
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()} style={styles.backBtn}>
          <Feather name={step > 1 ? 'arrow-left' : 'x'} size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ser anfitrión</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      {/* Progress */}
      <View style={styles.progress}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.progressDot, step >= i && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>Tu negocio</Text>
            <Text style={styles.stepSub}>Cuéntanos qué tipo de anfitrión serás</Text>

            <Text style={styles.label}>Tipo de negocio</Text>
            {BUSINESS_TYPES.map((bt) => (
              <TouchableOpacity
                key={bt.id}
                style={[styles.optionCard, businessType === bt.id && styles.optionCardActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBusinessType(bt.id); }}
                activeOpacity={0.75}
              >
                <Feather name={bt.icon as any} size={20} color={businessType === bt.id ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} />
                <Text style={[styles.optionLabel, businessType === bt.id && styles.optionLabelActive]}>{bt.label}</Text>
                {businessType === bt.id && <Feather name="check" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}

            <Text style={styles.label}>Nombre del negocio *</Text>
            <TextInput style={styles.input} placeholder="ej. La Terraza de Antigua" placeholderTextColor="rgba(255,255,255,0.3)" value={businessName} onChangeText={setBusinessName} autoCapitalize="words" />

            <Text style={styles.label}>Teléfono / WhatsApp *</Text>
            <TextInput style={styles.input} placeholder="+502 5555-0000" placeholderTextColor="rgba(255,255,255,0.3)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Tus experiencias</Text>
            <Text style={styles.stepSub}>Describe qué ofreces a los usuarios de golit</Text>

            <Text style={styles.label}>Descripción del negocio *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="¿Qué hace especial tu negocio? (mín. 20 caracteres)" placeholderTextColor="rgba(255,255,255,0.3)" value={description} onChangeText={setDescription} multiline numberOfLines={4} />

            <Text style={styles.label}>Describe las experiencias que ofrecerás *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="ej. Clases de cocina guatemalteca para grupos de hasta 12 personas..." placeholderTextColor="rgba(255,255,255,0.3)" value={experienceDescription} onChangeText={setExperienceDescription} multiline numberOfLines={4} />

            <Text style={styles.label}>Tipo de experiencias *</Text>
            <View style={styles.chips}>
              {EXPERIENCE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, selectedTypes.includes(t) && styles.chipActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleType(t); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, selectedTypes.includes(t) && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>Ubicación y contacto</Text>
            <Text style={styles.stepSub}>Último paso — ¡ya casi!</Text>

            <Text style={styles.label}>Dirección *</Text>
            <TextInput style={styles.input} placeholder="Calle, colonia, zona" placeholderTextColor="rgba(255,255,255,0.3)" value={address} onChangeText={setAddress} autoCapitalize="words" />

            <Text style={styles.label}>Ciudad</Text>
            <TextInput style={styles.input} placeholder="Guatemala" placeholderTextColor="rgba(255,255,255,0.3)" value={city} onChangeText={setCity} autoCapitalize="words" />

            <Text style={styles.label}>País</Text>
            <TextInput style={styles.input} placeholder="Guatemala" placeholderTextColor="rgba(255,255,255,0.3)" value={country} onChangeText={setCountry} autoCapitalize="words" />

            <Text style={styles.label}>Instagram (opcional)</Text>
            <TextInput style={styles.input} placeholder="@tu_negocio" placeholderTextColor="rgba(255,255,255,0.3)" value={instagram} onChangeText={setInstagram} autoCapitalize="none" autoCorrect={false} />

            <View style={styles.terms}>
              <Feather name="info" size={14} color="rgba(255,255,255,0.35)" />
              <Text style={styles.termsText}>
                Al enviar aceptas los Términos de Anfitriones de golit. Revisaremos tu solicitud en 2-3 días hábiles.
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, (!canNext() || submitApplication.isPending) && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext() || submitApplication.isPending}
          activeOpacity={0.85}
        >
          {submitApplication.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{step < 3 ? 'Siguiente' : 'Enviar solicitud'}</Text>
              <Feather name={step < 3 ? 'arrow-right' : 'send'} size={16} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  progress: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, justifyContent: 'center' },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2A2A2A' },
  progressDotActive: { backgroundColor: '#E8621A', width: 24 },
  content: { padding: Spacing.base },
  stepTitle: { color: '#FFFFFF', fontSize: FontSize['2xl'], fontWeight: '700', marginBottom: 4 },
  stepSub: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.sm, marginBottom: Spacing.xl },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    backgroundColor: '#1A1A1A', borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base, paddingVertical: 14,
    color: '#FFFFFF', fontSize: FontSize.base,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1A1A1A', borderRadius: Radius.lg, padding: Spacing.base,
    borderWidth: 0.5, borderColor: '#2A2A2A', marginBottom: Spacing.sm,
  },
  optionCardActive: { backgroundColor: '#E8621A', borderColor: '#E8621A' },
  optionLabel: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, fontWeight: '600' },
  optionLabelActive: { color: '#FFFFFF' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.xs },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  chipActive: { backgroundColor: '#E8621A', borderColor: '#E8621A' },
  chipText: { color: 'rgba(255,255,255,0.55)', fontSize: FontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  terms: { flexDirection: 'row', gap: 8, marginTop: Spacing.lg, alignItems: 'flex-start' },
  termsText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, flex: 1, lineHeight: 18 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background, borderTopWidth: 0.5, borderTopColor: '#1A1A1A',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md,
  },
  nextBtn: {
    backgroundColor: '#E8621A', borderRadius: Radius.lg, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
});
