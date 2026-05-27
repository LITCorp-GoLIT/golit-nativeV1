import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const registerToken = async (userId: string) => {
  if (!Device.isDevice) return; // simulator — skip

  const { status: existing } = await Notifications.getPermissionsAsync();
  const finalStatus =
    existing === 'granted'
      ? existing
      : (await Notifications.requestPermissionsAsync()).status;

  if (finalStatus !== 'granted') return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? 'golit-native';

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    await supabase.from('push_tokens_native').upsert(
      { user_id: userId, token, platform: Platform.OS },
      { onConflict: 'user_id,token' },
    );
  } catch {
    // Table may not exist yet — fail silently
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Golit',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8621A',
    });
  }
};

export const usePushNotifications = () => {
  const { user } = useAuth();
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    if (user?.id) registerToken(user.id);

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url as string | undefined;
        if (url) {
          // Handled by the deep link system — Linking.openURL is called
          // from the linking config in RootNavigator
          const { Linking } = require('react-native');
          Linking.openURL(url).catch(() => {});
        }
      },
    );

    return () => {
      responseListener.current?.remove();
    };
  }, [user?.id]);
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();

  const getPrefs = async () => {
    if (!user) return null;
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    return data;
  };

  const updatePrefs = async (prefs: {
    push_enabled?: boolean;
    nearby_events?: boolean;
    interest_events?: boolean;
    new_experiences?: boolean;
  }) => {
    if (!user) return;
    await supabase.from('notification_preferences').upsert(
      { user_id: user.id, ...prefs, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  };

  return { getPrefs, updatePrefs };
};
