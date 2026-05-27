import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useCapturePayPalOrder } from '../hooks/useBooking';
import { Colors } from '../constants/colors';
import { FontSize, Spacing } from '../constants/theme';
import { RootStackParamList } from '../types';

type RouteParams = RouteProp<RootStackParamList, 'PayPalWebView'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const SUCCESS_HOSTS = ['golit.io', 'golit://'];
const CANCEL_PATHS = ['cancel', 'cancelUrl'];

export const PayPalWebViewScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { approvalUrl, bookingId } = route.params;

  const captureOrder = useCapturePayPalOrder();
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const captured = useRef(false);

  const handleNavChange = async (state: WebViewNavigation) => {
    const url = state.url ?? '';

    const isCancelled = CANCEL_PATHS.some((p) => url.includes(p));
    if (isCancelled) {
      navigation.goBack();
      return;
    }

    const isSuccess = SUCCESS_HOSTS.some((h) => url.includes(h)) && url.includes('token=');
    if (isSuccess && !captured.current) {
      captured.current = true;
      setCapturing(true);

      const tokenMatch = url.match(/token=([^&]+)/);
      const orderId = tokenMatch?.[1] ?? '';

      try {
        await captureOrder.mutateAsync({ orderId, bookingId });
        navigation.replace('OrderConfirmation', {
          bookingId,
          experienceTitle: 'Tu experiencia',
        });
      } catch {
        setCapturing(false);
        captured.current = false;
      }
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago seguro — PayPal</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      {capturing && (
        <View style={styles.capturingOverlay}>
          <ActivityIndicator color="#E8621A" size="large" />
          <Text style={styles.capturingText}>Procesando pago…</Text>
        </View>
      )}

      <WebView
        source={{ uri: approvalUrl }}
        onNavigationStateChange={handleNavChange}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#E8621A" size="large" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '600' },
  webview: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  capturingOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  capturingText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '600' },
});
