import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';
import { FontSize, Spacing, Radius } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SavedScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Guardados</Text>
          <Text style={styles.subtitle}>Inicia sesión para guardar tus experiencias favoritas</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.btnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Guardados</Text>
        <Text style={styles.subtitle}>Aquí aparecerán las experiencias que guardaste</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  btnText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
});
