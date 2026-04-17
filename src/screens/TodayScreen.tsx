import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { DateStrip } from '../components/DateStrip';
import { CategoryChips } from '../components/CategoryChips';
import { HabitRow } from '../components/HabitRow';
import { FAB } from '../components/FAB';
import { EntryActionSheet } from '../components/EntryActionSheet';
import { useAppDrawer } from '../drawer';
import { habitActiveOnDate, habitEntry, useStore } from '../store';
import { Habit, EntryStatus } from '../types';
import { fmtDate } from '../utils/date';
import { theme, type } from '../theme';

export const TodayScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { openDrawer } = useAppDrawer();
  const { state, dispatch } = useStore();
  const [selected, setSelected] = useState<Date>(new Date());
  const [category, setCategory] = useState<string>('all');
  const [sheetHabit, setSheetHabit] = useState<Habit | null>(null);

  const activeHabits = useMemo(() => {
    return state.habits
      .filter((h) => !h.archived)
      .filter((h) => habitActiveOnDate(h, selected))
      .filter((h) => category === 'all' || h.categoryId === category);
  }, [state.habits, selected, category]);

  const categories = useMemo(
    () => [
      { id: 'all', name: 'All', icon: 'clipboard-list', color: theme.primary },
      ...state.categories
        .filter((c) => !c.isDefault || c.id === 'cat-task' || c.id === 'cat-other')
        .map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color })),
    ],
    [state.categories]
  );

  const onToggle = (h: Habit) => {
    const curr = habitEntry(h, selected);
    const next: EntryStatus = curr.status === 'done' ? 'pending' : 'done';
    dispatch({
      type: 'setEntry',
      habitId: h.id,
      entry: { ...curr, status: next },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Pinned header region — intrinsic height, no flex. */}
      <View>
        <ScreenHeader
          title="Today"
          onMenu={openDrawer}
          right={
            <>
              <Pressable hitSlop={8}>
                <MaterialCommunityIcons name="magnify" size={22} color={theme.text} />
              </Pressable>
              <Pressable hitSlop={8} onPress={() => setSelected(new Date())}>
                <MaterialCommunityIcons name="calendar-today" size={22} color={theme.text} />
              </Pressable>
              <Pressable hitSlop={8}>
                <MaterialCommunityIcons name="help-circle-outline" size={22} color={theme.text} />
              </Pressable>
            </>
          }
        />
        <DateStrip selected={selected} onSelect={setSelected} />
        <CategoryChips items={categories} selectedId={category} onSelect={setCategory} />
      </View>

      {/* List region — the only flex child. List shrinkage has nowhere to go. */}
      <View style={styles.listRegion}>
        <ScrollView contentContainerStyle={{ paddingTop: 4, paddingBottom: 120 }}>
          {activeHabits.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="sleep" size={72} color={theme.textSubtle} style={{ opacity: 0.3 }} />
              <Text style={styles.emptyTitle}>Nothing scheduled</Text>
              <Text style={styles.emptySub}>Tap + to add a habit or task</Text>
              <Pressable style={styles.emptyCta} onPress={() => nav.navigate('AddHabit')}>
                <Text style={styles.emptyCtaText}>Add your first habit</Text>
              </Pressable>
            </View>
          ) : (
            activeHabits.map((h) => {
              const entry = habitEntry(h, selected);
              const cat = state.categories.find((c) => c.id === h.categoryId);
              const prio = h.priority ? ` | ${h.priority}P` : '';
              return (
                <HabitRow
                  key={h.id}
                  habit={h}
                  status={entry.status}
                  subtitle={`${cat?.name ?? 'Habit'}${prio}`}
                  onPress={() => setSheetHabit(h)}
                  onToggle={() => onToggle(h)}
                />
              );
            })
          )}
        </ScrollView>
      </View>

      <FAB onPress={() => nav.navigate('AddHabit')} />

      {sheetHabit && (
        <EntryActionSheet
          habit={sheetHabit}
          date={selected}
          currentEntry={sheetHabit.entries[fmtDate(selected)]}
          onClose={() => setSheetHabit(null)}
          onSetStatus={(status, note) => {
            dispatch({
              type: 'setEntry',
              habitId: sheetHabit.id,
              entry: {
                date: fmtDate(selected),
                status,
                note,
              },
            });
            setSheetHabit(null);
          }}
          onReset={() => {
            dispatch({
              type: 'setEntry',
              habitId: sheetHabit.id,
              entry: { date: fmtDate(selected), status: 'pending' },
            });
            setSheetHabit(null);
          }}
          onOpenDetail={() => {
            const id = sheetHabit.id;
            setSheetHabit(null);
            nav.navigate('HabitDetail', { habitId: id });
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  listRegion: { flex: 1 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    ...type.title,
    color: theme.text,
    marginTop: 12,
  },
  emptySub: {
    ...type.body,
    color: theme.textDim,
    marginTop: 4,
  },
  emptyCta: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: theme.primary + '22',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.primary + '55',
  },
  emptyCtaText: {
    ...type.label,
    color: theme.primary,
  },
});
