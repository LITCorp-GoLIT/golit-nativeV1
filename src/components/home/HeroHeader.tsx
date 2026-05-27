import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export const HERO_H = 100;

export const HeroHeader: React.FC = () => (
  <View style={styles.container}>
    <Image
      source={require('../../../assets/golit-logo-official.png')}
      style={styles.logo}
      resizeMode="contain"
    />
    <Text style={styles.tagline}>Encuentra tu siguiente plan</Text>
    <View style={styles.location}>
      <Feather name="map-pin" size={12} color="#E8621A" />
      <Text style={styles.locationText}>Antigua &amp; Zona 4, Guatemala</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: HERO_H,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 4,
  },
  logo: {
    width: 126,
    height: 40,
  },
  tagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: '#E8621A',
    fontSize: 12,
    fontWeight: '600',
  },
});
