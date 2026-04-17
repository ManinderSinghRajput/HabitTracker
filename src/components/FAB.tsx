import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, radius } from '../theme';

/**
 * Premium FAB:
 * - Gradient fill (primary -> primaryAlt) faked with two stacked layers
 *   so we don't require expo-linear-gradient at runtime.
 * - Colored shadow on the accent — universal premium cue.
 */
export const FAB: React.FC<{ onPress: () => void; icon?: string }> = ({
  onPress,
  icon = 'plus',
}) => (
  <Pressable onPress={onPress} style={styles.fab}>
    <View style={styles.gradientBase} />
    <View style={styles.gradientOverlay} />
    <MaterialCommunityIcons name={icon as any} size={28} color="#fff" />
  </Pressable>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  gradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.primary,
  },
  gradientOverlay: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: '90%',
    height: '90%',
    backgroundColor: theme.primaryAlt,
    opacity: 0.55,
    borderRadius: radius.lg,
    transform: [{ rotate: '25deg' }],
  },
});
