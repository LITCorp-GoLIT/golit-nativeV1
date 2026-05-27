import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../hooks/useAuth';
import { useHostStatus } from '../hooks/useHostStatus';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<Nav>();
  const { isHost, hasApplication, applicationStatus } = useHostStatus();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Feather name="user" size={48} color="rgba(255,255,255,0.15)" />
          <Text style={styles.title}>Tu perfil</Text>
          <Text style={styles.sub}>
            Inicia sesión para guardar tus planes favoritos y personalizar tu experiencia
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('Auth');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const memberYear = user.created_at ? new Date(user.created_at).getFullYear() : '—';
  const initial = user.email?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.meta}>Miembro desde {memberYear}</Text>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.navigate('MyBookings')}
          activeOpacity={0.75}
        >
          <Feather name="calendar" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.menuBtnText}>Mis reservas</Text>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.75}
        >
          <Feather name="settings" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.menuBtnText}>Configuración</Text>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {isHost ? (
          <TouchableOpacity
            style={[styles.menuBtn, styles.menuBtnHost]}
            onPress={() => navigation.navigate('HostDashboard')}
            activeOpacity={0.75}
          >
            <Feather name="bar-chart-2" size={16} color="#E8621A" />
            <Text style={[styles.menuBtnText, { color: '#E8621A' }]}>Dashboard de anfitrión</Text>
            <Feather name="chevron-right" size={16} color="#E8621A66" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ) : hasApplication ? (
          <View style={styles.applicationStatus}>
            <Feather name="clock" size={14} color="#F59E0B" />
            <Text style={styles.applicationStatusText}>
              Solicitud de anfitrión{' '}
              {applicationStatus === 'pending' ? 'en revisión' : applicationStatus === 'rejected' ? 'rechazada' : applicationStatus}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.navigate('BecomeHost')}
            activeOpacity={0.75}
          >
            <Feather name="star" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.menuBtnText}>Ser anfitrión en golit</Text>
            <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await signOut();
          }}
          activeOpacity={0.75}
        >
          <Feather name="log-out" size={16} color="rgba(255,255,255,0.55)" />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  btn: {
    backgroundColor: '#E8621A',
    borderRadius: Radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  btnText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8621A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  avatarText: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  email: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing['3xl'],
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    backgroundColor: '#1A1A1A',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    marginBottom: Spacing.sm,
  },
  menuBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  signOutText: { color: 'rgba(255,255,255,0.55)', fontSize: FontSize.sm, fontWeight: '600' },
  menuBtnHost: { borderColor: '#E8621A33', backgroundColor: '#E8621A0A' },
  applicationStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: Radius.md, backgroundColor: '#F59E0B11',
    borderWidth: 0.5, borderColor: '#F59E0B33', marginBottom: Spacing.sm,
  },
  applicationStatusText: { color: '#F59E0B', fontSize: FontSize.sm, fontWeight: '600' },
});
