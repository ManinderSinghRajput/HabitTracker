import React, { useEffect, useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconBadge } from './IconBadge';
import { Habit, EntryStatus } from '../types';
import { theme, radius, type } from '../theme';

type Props = {
  habit: Habit;
  status: EntryStatus;
  subtitle?: string;
  onPress: () => void;
  onToggle?: () => void;
  showCheck?: boolean;
};

export const HabitRow: React.FC<Props> = ({
  habit,
  status,
  subtitle,
  onPress,
  onToggle,
  showCheck = true,
}) => {
  const done = status === 'done';
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <IconBadge icon={habit.icon} color={habit.color} size={44} />
      <View style={styles.body}>
        <Text
          style={[
            styles.title,
            done && { textDecorationLine: 'line-through', opacity: 0.55 },
          ]}
          numberOfLines={1}
        >
          {habit.name}
        </Text>
        <View style={[styles.tag, { backgroundColor: habit.color + '22' }]}>
          <Text style={[styles.tagText, { color: habit.color }]}>
            {subtitle ?? 'Habit'}
          </Text>
        </View>
      </View>
      {showCheck && (
        <Pressable onPress={onToggle} hitSlop={12} style={styles.check}>
          <CheckIcon status={status} color={habit.color} />
        </Pressable>
      )}
    </Pressable>
  );
};

const CheckIcon: React.FC<{ status: EntryStatus; color: string }> = ({
  status,
  color,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current !== status) {
      scale.setValue(0.8);
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
      prevStatus.current = status;
    }
  }, [status, scale]);

  const wrap = (children: React.ReactNode, bg: string, borderless = false) => (
    <Animated.View
      style={[
        styles.badge,
        { backgroundColor: bg, transform: [{ scale }] },
        borderless && styles.badgeEmpty,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (status === 'done') {
    return wrap(<MaterialCommunityIcons name="check" size={18} color="#fff" />, color);
  }
  if (status === 'fail') {
    return wrap(<MaterialCommunityIcons name="close" size={18} color="#fff" />, theme.danger);
  }
  if (status === 'skip') {
    return wrap(<MaterialCommunityIcons name="minus" size={18} color="#fff" />, theme.textSubtle);
  }
  return wrap(null, 'transparent', true);
};

const styles = StyleSheet.create({
  // Card-wrapped row — no dividers, spacing does the work.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    ...type.body,
    color: theme.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  check: {
    paddingLeft: 8,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmpty: {
    borderWidth: 2,
    borderColor: theme.textSubtle,
    backgroundColor: 'transparent',
  },
});
