import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { RootStackParamList } from '../types';

type Mode = 'login' | 'signup';
type Nav = NativeStackNavigationProp<RootStackParamList>;

export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigation = useNavigation<Nav>();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);

    const { error: authError } =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);

    setLoading(false);
    if (authError) {
      setError(
        authError.message.includes('Invalid login credentials')
          ? 'Email o contraseña incorrectos'
          : authError.message.includes('User already registered')
          ? 'Ya existe una cuenta con ese email'
          : authError.message,
      );
      return;
    }
    if (mode === 'signup') {
      navigation.replace('Onboarding');
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Image
            source={require('../../assets/golit-logo-official.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.tagline}>
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>
                  {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Google OAuth — placeholder */}
            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.75}
              onPress={() => setError('Google OAuth disponible próximamente')}
            >
              <Text style={styles.googleBtnText}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle mode */}
          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing['3xl'],
  },
  logo: { width: 140, height: 44, marginBottom: Spacing.lg },
  tagline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FontSize.base,
    marginBottom: Spacing.xl,
  },
  form: { width: '100%', gap: Spacing.sm },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: FontSize.base,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  error: {
    color: Colors.error,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#E8621A',
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  googleBtn: {
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#333',
  },
  googleBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  toggle: { marginTop: Spacing.xl },
  toggleText: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
});
