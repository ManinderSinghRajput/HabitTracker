import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, type } from '../theme';

type Props = {
  title: string;
  onMenu?: () => void;
  onBack?: () => void;
  right?: React.ReactNode;
};

export const ScreenHeader: React.FC<Props> = ({ title, onMenu, onBack, right }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={theme.primary} />
          </Pressable>
        ) : onMenu ? (
          <Pressable onPress={onMenu} hitSlop={12}>
            <MaterialCommunityIcons name="menu" size={24} color={theme.primary} />
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    ...type.display,
    color: theme.text,
    marginLeft: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
