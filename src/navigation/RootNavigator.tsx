import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ExperienceDetailScreen } from '../screens/ExperienceDetailScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/OrderConfirmationScreen';
import { PayPalWebViewScreen } from '../screens/PayPalWebViewScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { SignalDetailScreen } from '../screens/SignalDetailScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { BecomeHostScreen } from '../screens/BecomeHostScreen';
import { HostDashboardScreen } from '../screens/HostDashboardScreen';
import { QRScanScreen } from '../screens/QRScanScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['golit://', 'https://golit.io'],
  config: {
    screens: {
      ExperienceDetail: 'experience/:id',
      SignalDetail: 'signal/:id',
      Checkout: 'checkout/:experienceId',
      MyBookings: 'my-bookings',
      ChatList: 'chats',
      ChatRoom: 'chat/:conversationId',
      Settings: 'settings',
    },
  },
};

const NAV_THEME = {
  dark: true,
  colors: {
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.backgroundElevated,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

export const RootNavigator: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#E8621A" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={NAV_THEME} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="ExperienceDetail"
          component={ExperienceDetailScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmationScreen}
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen
          name="PayPalWebView"
          component={PayPalWebViewScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="SignalDetail"
          component={SignalDetailScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ChatList"
          component={ChatListScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="BecomeHost"
          component={BecomeHostScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="HostDashboard"
          component={HostDashboardScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="QRScan"
          component={QRScanScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
