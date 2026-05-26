import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ExperienceDetailScreen } from '../screens/ExperienceDetailScreen';
import { HostPublicScreen } from '../screens/HostPublicScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => (
  <NavigationContainer
    theme={{
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
        regular: { fontFamily: 'System', fontWeight: '400' },
        medium: { fontFamily: 'System', fontWeight: '500' },
        bold: { fontFamily: 'System', fontWeight: '700' },
        heavy: { fontFamily: 'System', fontWeight: '900' },
      },
    }}
  >
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="ExperienceDetail"
        component={ExperienceDetailScreen}
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="HostPublic"
        component={HostPublicScreen}
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
