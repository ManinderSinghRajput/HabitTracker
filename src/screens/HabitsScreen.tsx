import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../components/ScreenHeader';
import { CategoryChips } from '../components/CategoryChips';
import { FAB } from '../components/FAB';
import { IconBadge } from '../components/IconBadge';
import { useAppDrawer } from '../drawer';
import { computeStats, useStore } from '../store';
import { Habit } from '../types';
import { theme, radius, type } from '../theme';

export const HabitsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { openDrawer } = useAppDrawer();
  const { state } = useStore();
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(
    () => [
      { id: 'all', name: 'All', icon: 'clipboard-list', color: theme.primary },
      ...state.categories
        .filter((c) => !c.isDefault || c.id === 'cat-task' || c.id === 'cat-other')
        .map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color })),
    ],
    [state.categories]
  );

  const habits = useMemo(
    () =>
      state.habits
        .filter((h) => !h.archived)
        .filter((h) => category === 'all' || h.categoryId === category),
    [state.habits, category]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Pinned header region */}
      <View>
        <ScreenHeader
          title="Habits"
          onMenu={openDrawer}
          right={
            <>
              <Pressable hitSlop={8}>
                <MaterialCommunityIcons name="magnify" size={22} color={theme.text} />
              </Pressable>
              <Pressable hitSlop={8}>
                <MaterialCommunityIcons name="tray-arrow-down" size={22} color={theme.text} />
              </Pressable>
            </>
          }
        />
        <CategoryChips items={categories} selectedId={category} onSelect={setCategory} />
      </View>

      {/* List region — only flex child */}
      <View style={styles.listRegion}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 120 }}>
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onOpen={() => nav.navigate('HabitDetail', { habitId: h.id })} />
          ))}
          {habits.length === 0 && (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="medal-outline" size={72} color={theme.textSubtle} style={{ opacity: 0.3 }} />
              <Text style={styles.emptyTitle}>No habits yet</Text>
              <Text style={styles.emptySub}>Tap + to add a new habit</Text>
              <Pressable style={styles.emptyCta} onPress={() => nav.navigate('AddHabit')}>
                <Text style={styles.emptyCtaText}>Add your first habit</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>

      <FAB onPress={() => nav.navigate('AddHabit')} />
    </SafeAreaView>
  );
};

const HabitCard: React.FC<{ habit: Habit; onOpen: () => void }> = ({ habit, onOpen }) => {
  const stats = computeStats(habit);
  const freq =
    habit.frequency.kind === 'daily'
      ? 'Every day'
      : habit.frequency.kind === 'weekly'
      ? 'Weekly'
      : habit.frequency.kind === 'monthly'
      ? 'Monthly'
      : `Every ${habit.frequency.everyNDays}d`;
  return (
    <Pressable onPress={onOpen} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{habit.name}</Text>
          <View style={[styles.tag, { backgroundColor: habit.color + '22' }]}>
            <Text style={[styles.tagText, { color: habit.color }]}>
              {freq}
              {habit.priority ? ` | ${habit.priority}P` : ''}
            </Text>
          </View>
        </View>
        <IconBadge icon={habit.icon} color={habit.color} size={44} />
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="link-variant" size={16} color={habit.color} />
          <Text style={[styles.statText, { color: habit.color }]}>{stats.streak}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="check-circle-outline" size={16} color={habit.color} />
          <Text style={[styles.statText, { color: theme.text }]}>{stats.percent}%</Text>
        </View>
        <View style={{ flex: 1 }} />
        <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={theme.textDim} />
        <MaterialCommunityIcons name="chart-bar" size={18} color={theme.textDim} style={{ marginLeft: 18 }} />
        <MaterialCommunityIcons name="swap-vertical" size={18} color={theme.textDim} style={{ marginLeft: 18 }} />
        <MaterialCommunityIcons name="dots-vertical" size={18} color={theme.textDim} style={{ marginLeft: 14 }} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  listRegion: { flex: 1 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...type.title,
    fontSize: 17,
    color: theme.text,
    marginBottom: 6,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: { fontSize: 12, fontWeight: '600' },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    // Softer divider, inside the card.
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 16,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { ...type.title, color: theme.text, marginTop: 12 },
  emptySub: { ...type.body, color: theme.textDim, marginTop: 4 },
  emptyCta: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: theme.primary + '22',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.primary + '55',
  },
  emptyCtaText: { ...type.label, color: theme.primary },
});
