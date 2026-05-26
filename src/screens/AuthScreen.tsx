import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius, Shadow } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'welcome' | 'login' | 'signup';

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = () => setError(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Completa todos los campos');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError('Correo o contraseña incorrectos');
      return;
    }
    navigation.goBack();
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError(null);
    const { error: err } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (err) {
      setError(err.message ?? 'Error al crear la cuenta');
      return;
    }
    setMode('login');
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo area */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>G</Text>
            </View>
            <Text style={styles.appName}>Golit</Text>
            <Text style={styles.tagline}>Donde encuentras tu siguiente plan</Text>
          </View>

          {/* Welcome mode */}
          {mode === 'welcome' && (
            <View style={styles.form}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => { resetError(); setMode('login'); }}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => { resetError(); setMode('signup'); }}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Crear cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.ghostBtnText}>Explorar sin cuenta</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Login mode */}
          {mode === 'login' && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Bienvenido de nuevo</Text>

              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.textPrimary} />
                ) : (
                  <Text style={styles.primaryBtnText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { resetError(); setMode('signup'); }}>
                <Text style={styles.switchText}>
                  ¿No tienes cuenta? <Text style={styles.switchLink}>Crear una</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { resetError(); setMode('welcome'); }}>
                <Text style={styles.ghostBtnText}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Signup mode */}
          {mode === 'signup' && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Crea tu cuenta</Text>

              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 6 caracteres)"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.textPrimary} />
                ) : (
                  <Text style={styles.primaryBtnText}>Crear cuenta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { resetError(); setMode('login'); }}>
                <Text style={styles.switchText}>
                  ¿Ya tienes cuenta? <Text style={styles.switchLink}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { resetError(); setMode('welcome'); }}>
                <Text style={styles.ghostBtnText}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.base,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadow.md,
  },
  logoText: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  appName: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
  },
  formTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    ...Shadow.md,
  },
  primaryBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  ghostBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  ghostBtnText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  switchLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
