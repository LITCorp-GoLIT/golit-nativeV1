import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { FontSize, Spacing } from '../constants/theme';

export const SocialScreen: React.FC = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Feather name="users" size={40} color={Colors.textMuted} />
      <Text style={styles.title}>Social</Text>
      <Text style={styles.subtitle}>Próximamente — ve lo que tus amigos están haciendo</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
});
