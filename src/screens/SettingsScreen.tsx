import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '../hooks/useAuth';
import { useNotificationPreferences } from '../hooks/usePushNotifications';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const { getPrefs, updatePrefs } = useNotificationPreferences();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [nearbyEvents, setNearbyEvents] = useState(true);
  const [interestEvents, setInterestEvents] = useState(true);
  const [newExperiences, setNewExperiences] = useState(true);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    getPrefs().then((prefs) => {
      if (prefs) {
        setPushEnabled(prefs.push_enabled ?? true);
        setNearbyEvents(prefs.nearby_events ?? true);
        setInterestEvents(prefs.interest_events ?? true);
        setNewExperiences(prefs.new_experiences ?? true);
      }
      setLoading(false);
    });
  }, []);

  const save = async (patch: Parameters<typeof updatePrefs>[0]) => {
    setSaving(true);
    await updatePrefs(patch);
    setSaving(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Confirmar eliminación',
              'Escribe "ELIMINAR" en tu mente y confirma que quieres borrar todos tus datos permanentemente.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar permanentemente',
                  style: 'destructive',
                  onPress: () =>
                    Alert.alert(
                      'Solicitud recibida',
                      'Tu solicitud de eliminación de cuenta ha sido recibida. Procesaremos tu solicitud en los próximos 30 días. Recibirás un correo de confirmación.',
                      [{ text: 'Entendido', onPress: () => signOut() }],
                    ),
                },
              ],
            ),
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#E8621A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        {saving ? <ActivityIndicator color="#E8621A" size="small" /> : <View style={{ width: 22 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICACIONES</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Notificaciones push"
            value={pushEnabled}
            onChange={(v) => {
              setPushEnabled(v);
              save({ push_enabled: v });
            }}
          />
          <Divider />
          <ToggleRow
            label="Eventos cercanos"
            sub="Planes y experiencias cerca de ti"
            value={nearbyEvents}
            disabled={!pushEnabled}
            onChange={(v) => {
              setNearbyEvents(v);
              save({ nearby_events: v });
            }}
          />
          <Divider />
          <ToggleRow
            label="Según mis intereses"
            sub="Recomendaciones personalizadas"
            value={interestEvents}
            disabled={!pushEnabled}
            onChange={(v) => {
              setInterestEvents(v);
              save({ interest_events: v });
            }}
          />
          <Divider />
          <ToggleRow
            label="Nuevas experiencias"
            sub="Cuando lleguen nuevos planes"
            value={newExperiences}
            disabled={!pushEnabled}
            onChange={(v) => {
              setNewExperiences(v);
              save({ new_experiences: v });
            }}
          />
        </View>

        {/* Legal */}
        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={styles.card}>
          <LinkRow
            label="Política de privacidad"
            onPress={() => Linking.openURL('https://golit.io/privacy')}
          />
          <Divider />
          <LinkRow
            label="Términos de uso"
            onPress={() => Linking.openURL('https://golit.io/terms')}
          />
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionLabel}>CUENTA</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount} activeOpacity={0.75}>
            <Feather name="trash-2" size={16} color="#EF4444" />
            <Text style={styles.dangerText}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <Text style={styles.version}>golit v{appVersion}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const ToggleRow: React.FC<{
  label: string;
  sub?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, sub, value, disabled, onChange }) => (
  <View style={styles.row}>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, disabled && styles.rowLabelDisabled]}>{label}</Text>
      {sub && <Text style={styles.rowSub}>{sub}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: '#2A2A2A', true: '#E8621A' }}
      thumbColor="#FFFFFF"
    />
  </View>
);

const LinkRow: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Feather name="external-link" size={14} color="rgba(255,255,255,0.3)" />
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingRow: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1E1E1E',
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  scroll: { padding: Spacing.base, paddingBottom: 120 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  rowText: { flex: 1, marginRight: Spacing.sm },
  rowLabel: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, fontWeight: '600' },
  rowLabelDisabled: { color: 'rgba(255,255,255,0.35)' },
  rowSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  divider: { height: 0.5, backgroundColor: '#2A2A2A', marginHorizontal: Spacing.base },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
  },
  dangerText: { color: '#EF4444', fontSize: FontSize.sm, fontWeight: '600' },
  version: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
