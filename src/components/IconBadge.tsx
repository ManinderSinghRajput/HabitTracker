import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { radius } from '../theme';
import { resolveIconName } from '../utils/icons';

type Props = {
  icon: string;
  color: string;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
};

export const IconBadge: React.FC<Props> = ({
  icon,
  color,
  size = 44,
  iconSize,
  style,
}) => {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: radius.md,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={resolveIconName(icon) as any}
        size={iconSize ?? size * 0.55}
        color="#1a1a1a"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
