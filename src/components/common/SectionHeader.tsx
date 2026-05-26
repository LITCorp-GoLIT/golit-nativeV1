import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/theme';

interface Props {
  title: string;
  onSeeAll?: () => void;
}

export const SectionHeader: React.FC<Props> = ({ title, onSeeAll }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn} activeOpacity={0.7}>
        <Text style={styles.seeAll}>Ver todo</Text>
        <Feather name="chevron-right" size={16} color="#E8621A" />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: {
    color: '#E8621A',
    fontSize: 14,
    fontWeight: '500',
  },
});
