import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useVerifyCheckin } from '../hooks/useHostDashboard';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { RootStackParamList } from '../types';

type RouteParams = RouteProp<RootStackParamList, 'QRScan'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export const QRScanScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { hostId } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const verifyCheckin = useVerifyCheckin();

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await verifyCheckin.mutateAsync({ bookingId: data, hostId });
      Alert.alert(
        '✅ Checkin verificado',
        'La asistencia ha sido registrada exitosamente.',
        [{ text: 'Escanear otro', onPress: () => setScanned(false) }, { text: 'Volver', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        '❌ QR inválido',
        err.message ?? 'No se pudo verificar el checkin. Intenta de nuevo.',
        [{ text: 'Reintentar', onPress: () => setScanned(false) }],
      );
    }
  };

  if (!permission) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#E8621A" size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.permissionContainer}>
          <Feather name="camera-off" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={styles.permissionTitle}>Permiso de cámara requerido</Text>
          <Text style={styles.permissionSub}>Necesitamos acceso a la cámara para escanear QR de asistentes</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Permitir cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 12 }} onPress={() => navigation.goBack()}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: FontSize.sm }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <SafeAreaView edges={['top']} style={styles.overlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Viewfinder */}
      <View style={styles.viewfinder}>
        <View style={styles.vfInner}>
          <View style={[styles.vfCorner, styles.vfTL]} />
          <View style={[styles.vfCorner, styles.vfTR]} />
          <View style={[styles.vfCorner, styles.vfBL]} />
          <View style={[styles.vfCorner, styles.vfBR]} />
        </View>
      </View>

      {/* Bottom hint */}
      <SafeAreaView edges={['bottom']} style={styles.bottomHint}>
        {verifyCheckin.isPending ? (
          <View style={styles.hintCard}>
            <ActivityIndicator color="#E8621A" />
            <Text style={styles.hintText}>Verificando checkin…</Text>
          </View>
        ) : (
          <View style={styles.hintCard}>
            <Feather name="maximize" size={18} color="#E8621A" />
            <Text style={styles.hintText}>
              {scanned ? 'Procesando…' : 'Apunta al código QR del asistente'}
            </Text>
          </View>
        )}
        {scanned && !verifyCheckin.isPending && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => setScanned(false)}>
            <Text style={styles.retryBtnText}>Escanear otro</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

const CORNER = 22;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, padding: Spacing.base },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  viewfinder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  vfInner: { width: 240, height: 240, position: 'relative' },
  vfCorner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#E8621A', borderRadius: 2 },
  vfTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  vfTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  vfBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  vfBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  bottomHint: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.base, gap: Spacing.sm,
  },
  hintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: Radius.lg,
    padding: Spacing.base,
  },
  hintText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  retryBtn: {
    backgroundColor: '#E8621A', borderRadius: Radius.lg, paddingVertical: 14,
    alignItems: 'center',
  },
  retryBtnText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '700' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: 12 },
  permissionTitle: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  permissionSub: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  permBtn: { backgroundColor: '#E8621A', borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 32, marginTop: 12 },
  permBtnText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '700' },
});
