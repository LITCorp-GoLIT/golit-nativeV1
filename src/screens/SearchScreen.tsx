import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FontSize, Spacing } from '../constants/theme';
import { useExperiences } from '../hooks/useExperiences';
import { ExperienceCard } from '../components/common/ExperienceCard';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const { data: all = [], isLoading } = useExperiences();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.category ?? '').toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q),
    );
  }, [all, query]);

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ExperienceDetail', { id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
        <View style={styles.inputRow}>
          <Feather name="search" size={18} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={styles.input}
            placeholder="Eventos, lugares, categorías..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {query ? `Sin resultados para "${query}"` : 'Escribe para buscar'}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <ExperienceCard
              experience={item}
              onPress={() => handlePress(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: FontSize.base,
  },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  row: { gap: 10, marginBottom: 10 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
