import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../components/ScreenHeader';
import { FAB } from '../components/FAB';
import { HistoryCalendar, HistoryStatus } from '../components/HistoryCalendar';
import { useAppDrawer } from '../drawer';
import { useStore, taskActiveOnDate } from '../store';
import { Task } from '../types';
import { theme, radius, type } from '../theme';
import { fmtDate, todayStr } from '../utils/date';

export const TasksScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { openDrawer } = useAppDrawer();
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<'single' | 'recurring'>('single');
  const [historyTaskId, setHistoryTaskId] = useState<string | null>(null);
  // Lift month state so reopening the calendar remembers position.
  const [historyMonth, setHistoryMonth] = useState<Date>(new Date());

  const tasks = useMemo(
    () =>
      state.tasks.filter((t) =>
        tab === 'single' ? !t.recurring : !!t.recurring
      ),
    [state.tasks, tab]
  );

  // Always derive the open task from store — single source of truth.
  const historyTask = useMemo(
    () => state.tasks.find((t) => t.id === historyTaskId) ?? null,
    [state.tasks, historyTaskId]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Pinned header region */}
      <View>
        <ScreenHeader
          title="Tasks"
          onMenu={openDrawer}
          right={
            <>
              <Pressable hitSlop={8}>
                <MaterialCommunityIcons name="magnify" size={22} color={theme.text} />
              </Pressable>
              <Pressable hitSlop={8}>
                <MaterialCommunityIcons name="filter-variant" size={22} color={theme.text} />
              </Pressable>
              <Pressable hitSlop={8}>
                <MaterialCommunityIcons name="tray-arrow-down" size={22} color={theme.text} />
              </Pressable>
            </>
          }
        />
        <AnimatedTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { key: 'single', label: 'Single tasks' },
            { key: 'recurring', label: 'Recurring tasks' },
          ]}
        />
      </View>

      <View style={styles.listRegion}>
        <ScrollView contentContainerStyle={{ paddingTop: 6, paddingBottom: 120 }}>
          {tasks.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={96}
                color={theme.textSubtle}
                style={{ opacity: 0.3 }}
              />
              <Text style={styles.emptyTitle}>No tasks</Text>
              <Text style={styles.emptySub}>There are no upcoming tasks</Text>
              <Pressable style={styles.emptyCta} onPress={() => nav.navigate('AddTask')}>
                <Text style={styles.emptyCtaText}>Add your first task</Text>
              </Pressable>
            </View>
          ) : (
            tasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onOpen={() => nav.navigate('AddTask', { taskId: t.id })}
                onToggle={() =>
                  dispatch({
                    type: 'toggleTask',
                    id: t.id,
                    date: t.recurring ? todayStr() : undefined,
                  })
                }
                onHistory={() => setHistoryTaskId(t.id)}
              />
            ))
          )}
        </ScrollView>
      </View>

      <FAB onPress={() => nav.navigate('AddTask')} />

      {historyTask && (
        <HistoryCalendar
          visible
          title={historyTask.title}
          monthDate={historyMonth}
          onMonthChange={setHistoryMonth}
          onClose={() => setHistoryTaskId(null)}
          onPressDay={(date) => {
            const key = fmtDate(date);
            // Dispatch once — the useMemo will re-derive historyTask from state.
            dispatch({ type: 'toggleTask', id: historyTask.id, date: key });
          }}
          getStatus={(date) => getTaskStatus(historyTask, date)}
        />
      )}
    </SafeAreaView>
  );
};

/**
 * Returns the rendered status for a given day on a given task's history.
 *
 * Key fixes vs. previous version:
 *  - Today's incomplete task is 'pending' (outlined), not 'missed' (red).
 *  - Recurring tasks respect their frequency. Off-schedule days are 'off'.
 *  - startKey uses the date portion of createdAt without pointless round-trip.
 */
function getTaskStatus(task: Task, date: Date): HistoryStatus {
  const key = fmtDate(date);
  const todayKey = todayStr();
  const startKey = task.dueDate ?? fmtDate(new Date(task.createdAt));

  // Single task
  if (!task.recurring) {
    if (task.dueDate !== key) return 'off';
    if (task.completed) return 'done';
    if (key < todayKey) return 'missed';
    if (key > todayKey) return 'future';
    return 'pending'; // due today, still has time
  }

  // Recurring task — consult frequency.
  if (key < startKey) return 'off';
  if (!taskActiveOnDate(task, date, startKey)) return 'off';

  const done = task.completedDates?.includes(key);
  if (done) return 'done';
  if (key > todayKey) return 'future';
  if (key === todayKey) return 'pending';
  return 'missed';
}

/** Animated pill tabs. Indicator slides between positions. */
const AnimatedTabs: <T extends string>(props: {
  value: T;
  onChange: (v: T) => void;
  tabs: { key: T; label: string }[];
}) => React.ReactElement = ({ value, onChange, tabs }) => {
  const [widths, setWidths] = useState<number[]>([]);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;

  const onLayout = (i: number) => (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidths((prev) => {
      const next = [...prev];
      next[i] = w;
      return next;
    });
  };

  useEffect(() => {
    if (widths.length !== tabs.length || widths.some((w) => !w)) return;
    const index = tabs.findIndex((t) => t.key === value);
    const x = widths.slice(0, index).reduce((a, b) => a + b, 0);
    const targetW = Math.min(40, widths[index] - 24);
    const centeredX = x + (widths[index] - targetW) / 2;
    Animated.parallel([
      Animated.timing(indicatorX, {
        toValue: centeredX,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(indicatorW, {
        toValue: targetW,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, widths, tabs, indicatorX, indicatorW]);

  return (
    <View style={styles.tabs}>
      {tabs.map((t, i) => (
        <Pressable
          key={t.key as string}
          style={styles.tabBtn}
          onLayout={onLayout(i)}
          onPress={() => onChange(t.key)}
        >
          <Text
            style={[
              styles.tabText,
              value === t.key && { color: theme.text, fontWeight: '700' },
            ]}
          >
            {t.label}
          </Text>
        </Pressable>
      ))}
      <Animated.View
        style={[
          styles.tabIndicator,
          { left: indicatorX, width: indicatorW },
        ]}
      />
    </View>
  );
};

const TaskRow: React.FC<{
  task: Task;
  onOpen: () => void;
  onToggle: () => void;
  onHistory: () => void;
}> = ({ task, onOpen, onToggle, onHistory }) => {
  const done = task.recurring
    ? task.completedDates?.includes(todayStr())
    : task.completed;

  const scale = useRef(new Animated.Value(1)).current;
  const wasDone = useRef<boolean>(!!done);
  useEffect(() => {
    if (wasDone.current !== !!done) {
      scale.setValue(0.8);
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }).start();
      wasDone.current = !!done;
    }
  }, [done, scale]);

  return (
    <Pressable onPress={onOpen} style={styles.card}>
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        style={styles.cbTouch}
      >
        <Animated.View
          style={[
            styles.cb,
            done && styles.cbDone,
            { transform: [{ scale }] },
          ]}
        >
          {done && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
        </Animated.View>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.title,
            done && { textDecorationLine: 'line-through', color: theme.textDim, opacity: 0.6 },
          ]}
        >
          {task.title}
        </Text>
        {(task.dueDate || task.dueTime) && (
          <Text style={styles.sub}>
            {task.dueDate ?? ''} {task.dueTime ?? ''}
          </Text>
        )}
      </View>
      <Pressable onPress={onHistory} hitSlop={10} style={styles.historyBtn}>
        <MaterialCommunityIcons
          name="calendar-month-outline"
          size={22}
          color={theme.textDim}
        />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  listRegion: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    position: 'relative',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: { color: theme.textDim, fontSize: 15, fontWeight: '600' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 20,
  },
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
  // Card row — no dividers.
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
    gap: 12,
  },
  cbTouch: {
    paddingRight: 2,
  },
  cb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbDone: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  title: { ...type.body, color: theme.text },
  sub: { ...type.caption, color: theme.textDim, marginTop: 2 },
  historyBtn: { paddingHorizontal: 6, paddingVertical: 4 },
});
