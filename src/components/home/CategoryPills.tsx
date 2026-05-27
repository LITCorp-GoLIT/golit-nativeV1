import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export type ChipId =
  | 'today'
  | 'upcoming'
  | 'music'
  | 'comedy'
  | 'gastronomy'
  | 'cultural'
  | 'adventure'
  | 'nightlife'
  | 'sports'
  | 'wellness';

const CHIPS: Array<{ id: ChipId; label: string; icon: string }> = [
  { id: 'today',      label: 'Hoy',          icon: 'calendar'  },
  { id: 'upcoming',   label: 'Próximos',      icon: 'clock'     },
  { id: 'music',      label: 'Música',        icon: 'music'     },
  { id: 'comedy',     label: 'Comedia',       icon: 'smile'     },
  { id: 'gastronomy', label: 'Gastronomía',   icon: 'coffee'    },
  { id: 'cultural',   label: 'Cultural',      icon: 'book-open' },
  { id: 'adventure',  label: 'Aventura',      icon: 'compass'   },
  { id: 'nightlife',  label: 'Nightlife',     icon: 'moon'      },
  { id: 'sports',     label: 'Deportes',      icon: 'activity'  },
  { id: 'wellness',   label: 'Wellness',      icon: 'heart'     },
];

interface Props {
  activeChip: ChipId;
  onSelect: (id: ChipId) => void;
}

export const CategoryPills: React.FC<Props> = ({ activeChip, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.content}
    style={styles.scroll}
  >
    {CHIPS.map((chip) => {
      const active = chip.id === activeChip;
      return (
        <TouchableOpacity
          key={chip.id}
          onPress={() => onSelect(chip.id)}
          activeOpacity={0.75}
          style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
        >
          <Feather
            name={chip.icon as any}
            size={13}
            color={active ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
          />
          <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
            {chip.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 20,
  },
  content: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chipActive: {
    backgroundColor: '#E8621A',
    shadowColor: '#E8621A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  chipInactive: {
    backgroundColor: '#1A1A1A',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: 'rgba(255,255,255,0.55)',
  },
});
