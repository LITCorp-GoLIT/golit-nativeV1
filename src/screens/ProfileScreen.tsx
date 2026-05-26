import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

const MenuItem: React.FC<{ label: string; onPress: () => void; danger?: boolean }> = ({
  label,
  onPress,
  danger,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.menuLabel, danger && styles.menuDanger]}>{label}</Text>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContent}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>?</Text>
          </View>
          <Text style={styles.guestTitle}>Hola, explorador</Text>
          <Text style={styles.guestSubtitle}>Crea una cuenta para guardar tus planes favoritos</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = user.user_metadata?.full_name ?? user.email ?? 'Usuario';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar & name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Cuenta</Text>
          <MenuItem label="Mis reservas" onPress={() => {}} />
          <MenuItem label="Notificaciones" onPress={() => {}} />
          <MenuItem label="Preferencias" onPress={() => {}} />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Soporte</Text>
          <MenuItem label="Ayuda" onPress={() => {}} />
          <MenuItem label="Términos de servicio" onPress={() => {}} />
          <MenuItem label="Política de privacidad" onPress={() => {}} />
        </View>

        <View style={styles.menuSection}>
          <MenuItem label="Cerrar sesión" onPress={handleSignOut} danger />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarInitial: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  displayName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  email: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  menuSection: {
    marginTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  menuSectionTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  menuLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  menuDanger: {
    color: Colors.error,
  },
  menuArrow: {
    color: Colors.textMuted,
    fontSize: FontSize.lg,
  },
  guestContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  guestTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  guestSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  primaryBtnText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
});
