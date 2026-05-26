import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<Props> = ({ size = 'large', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={Colors.primary} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={Colors.primary} style={styles.inline} />;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline: {
    margin: 20,
  },
});
