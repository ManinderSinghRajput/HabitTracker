import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { ScreenHeader } from '../components/ScreenHeader';
import { IconBadge } from '../components/IconBadge';
import { useStore } from '../store';
import { Habit, HabitType } from '../types';
import { theme, radius, palette } from '../theme';
import { uid } from '../utils/id';
import { fmtDate } from '../utils/date';
import { resolveIconName } from '../utils/icons';
import { RootStackParamList } from '../navigation';

const ICONS = [
  'star', 'heart', 'trophy', 'lightning-bolt', 'run', 'dumbbell',
  'book-open-variant', 'meditation', 'water', 'food-apple',
  'silverware-fork-knife', 'coffee', 'bed', 'water-outline', 'cash',
  'note-text-outline', 'language-python', 'pencil', 'music', 'palette',
  'shape-outline', 'target', 'trending-up', 'calendar-check', 'clipboard-check',
];

export const AddHabitScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddHabit'>>();
  const { state, dispatch } = useStore();
  const editing = useMemo(
    () => state.habits.find((h) => h.id === route.params?.habitId),
    [route.params?.habitId, state.habits]
  );

  const [name, setName] = useState(editing?.name ?? '');
  const [desc, setDesc] = useState(editing?.description ?? '');
  const [icon, setIcon] = useState(editing?.icon ?? 'star');
  const [color, setColor] = useState(editing?.color ?? palette[0]);
  const [type, setType] = useState<HabitType>(editing?.type ?? 'habit');
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? 'cat-habit');
  const [freqKind, setFreqKind] = useState<'daily' | 'weekly' | 'interval'>(
    editing?.frequency.kind === 'weekly'
      ? 'weekly'
      : editing?.frequency.kind === 'interval'
      ? 'interval'
      : 'daily'
  );
  const [weekDays, setWeekDays] = useState<number[]>(
    editing?.frequency.kind === 'weekly' ? editing.frequency.days : [1, 2, 3, 4, 5]
  );
  const [everyN, setEveryN] = useState<string>(
    editing?.frequency.kind === 'interval'
      ? String(editing.frequency.everyNDays)
      : '2'
  );
  const [priority, setPriority] = useState<number>(editing?.priority ?? 3);
  const [reminder, setReminder] = useState(
    editing?.reminderTimes?.[0] ?? ''
  );
  const [target, setTarget] = useState(
    editing?.targetPerDay ? String(editing.targetPerDay) : ''
  );
  const [unit, setUnit] = useState(editing?.unit ?? '');

  const save = () => {
    if (!name.trim()) return;
    const freq =
      freqKind === 'daily'
        ? { kind: 'daily' as const }
        : freqKind === 'weekly'
        ? { kind: 'weekly' as const, days: weekDays }
        : { kind: 'interval' as const, everyNDays: parseInt(everyN, 10) || 1 };

    const habit: Habit = {
      id: editing?.id ?? uid(),
      name: name.trim(),
      description: desc.trim() || undefined,
      type,
      categoryId,
      icon,
      color,
      frequency: freq,
      targetPerDay: target ? parseInt(target, 10) : undefined,
      unit: unit || undefined,
      priority,
      reminderTimes: reminder ? [reminder] : undefined,
      startDate: editing?.startDate ?? fmtDate(new Date()),
      createdAt: editing?.createdAt ?? Date.now(),
      entries: editing?.entries ?? {},
    };

    dispatch({ type: editing ? 'updateHabit' : 'addHabit', habit });
    nav.goBack();
  };

  const deleteHabit = () => {
    if (!editing) return;
    dispatch({ type: 'deleteHabit', id: editing.id });
    nav.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={editing ? 'Edit habit' : 'New habit'}
        onBack={() => nav.goBack()}
        right={
          editing ? (
            <Pressable onPress={deleteHabit} hitSlop={8}>
              <MaterialCommunityIcons name="delete" size={22} color={theme.danger} />
            </Pressable>
          ) : null
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View style={styles.typeRow}>
          {(['habit', 'quit', 'task'] as HabitType[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.typeBtn, type === t && { borderColor: color, backgroundColor: color + '22' }]}
              onPress={() => setType(t)}
            >
              <MaterialCommunityIcons
                name={
                  t === 'habit'
                    ? 'trending-up'
                    : t === 'quit'
                    ? 'close-octagon-outline'
                    : 'check-circle-outline'
                }
                size={22}
                color={type === t ? color : theme.textDim}
              />
              <Text style={[styles.typeLabel, type === t && { color }]}>
                {t === 'habit' ? 'Habit' : t === 'quit' ? 'Quit' : 'Task'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.iconRow}>
          <IconBadge icon={icon} color={color} size={64} iconSize={34} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <TextInput
              placeholder="Habit name"
              placeholderTextColor={theme.textSubtle}
              value={name}
              onChangeText={setName}
              style={styles.nameInput}
            />
            <TextInput
              placeholder="Description (optional)"
              placeholderTextColor={theme.textSubtle}
              value={desc}
              onChangeText={setDesc}
              style={styles.descInput}
            />
          </View>
        </View>

        <Text style={styles.section}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 6 }}>
            {state.categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  setCategoryId(c.id);
                  setColor(c.color);
                }}
                style={[
                  styles.chip,
                  categoryId === c.id && {
                    backgroundColor: c.color + '22',
                    borderColor: c.color,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={resolveIconName(c.icon) as any}
                  size={16}
                  color={categoryId === c.id ? c.color : theme.textDim}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.chipText,
                    { color: categoryId === c.id ? c.color : theme.textDim },
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.section}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((i) => (
            <Pressable
              key={i}
              onPress={() => setIcon(i)}
              style={[
                styles.iconCell,
                icon === i && { borderColor: color, borderWidth: 2 },
              ]}
            >
              <MaterialCommunityIcons name={resolveIconName(i) as any} size={22} color={color} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Color</Text>
        <View style={styles.colorGrid}>
          {palette.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorCell,
                { backgroundColor: c },
                color === c && { borderWidth: 3, borderColor: '#fff' },
              ]}
            />
          ))}
        </View>

        <Text style={styles.section}>Frequency</Text>
        <View style={styles.segRow}>
          {(['daily', 'weekly', 'interval'] as const).map((k) => (
            <Pressable
              key={k}
              style={[styles.seg, freqKind === k && styles.segActive]}
              onPress={() => setFreqKind(k)}
            >
              <Text
                style={[
                  styles.segText,
                  freqKind === k && { color: theme.primary, fontWeight: '700' },
                ]}
              >
                {k === 'daily' ? 'Every day' : k === 'weekly' ? 'Weekly' : 'Interval'}
              </Text>
            </Pressable>
          ))}
        </View>

        {freqKind === 'weekly' && (
          <View style={styles.dowRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => {
              const active = weekDays.includes(idx);
              return (
                <Pressable
                  key={idx}
                  onPress={() =>
                    setWeekDays((prev) =>
                      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
                    )
                  }
                  style={[styles.dow, active && { backgroundColor: color }]}
                >
                  <Text style={[styles.dowText, active && { color: '#fff' }]}>{d}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {freqKind === 'interval' && (
          <View style={styles.rowInput}>
            <Text style={styles.rowLabel}>Every</Text>
            <TextInput
              value={everyN}
              onChangeText={setEveryN}
              keyboardType="numeric"
              style={styles.smallInput}
            />
            <Text style={styles.rowLabel}>days</Text>
          </View>
        )}

        <Text style={styles.section}>Priority</Text>
        <View style={styles.priRow}>
          {[1, 2, 3, 4, 5].map((p) => (
            <Pressable
              key={p}
              style={[
                styles.priBtn,
                priority === p && { backgroundColor: color + '33', borderColor: color },
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priText, priority === p && { color }]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Target / Unit (optional)</Text>
        <View style={styles.rowInput}>
          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor={theme.textSubtle}
            style={[styles.smallInput, { width: 80 }]}
          />
          <TextInput
            value={unit}
            onChangeText={setUnit}
            placeholder="unit (e.g. glasses)"
            placeholderTextColor={theme.textSubtle}
            style={[styles.fullInput, { flex: 1, marginLeft: 10 }]}
          />
        </View>

        <Text style={styles.section}>Reminder (HH:mm)</Text>
        <TextInput
          value={reminder}
          onChangeText={setReminder}
          placeholder="08:00"
          placeholderTextColor={theme.textSubtle}
          style={styles.fullInput}
        />

        <Pressable style={[styles.saveBtn, { backgroundColor: color }]} onPress={save}>
          <Text style={styles.saveText}>{editing ? 'UPDATE' : 'SAVE'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  typeLabel: { color: theme.textDim, marginTop: 4, fontSize: 13 },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameInput: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  descInput: {
    color: theme.text,
    fontSize: 14,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  section: { color: theme.textDim, marginTop: 18, marginBottom: 8, fontWeight: '600' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  segRow: { flexDirection: 'row', backgroundColor: theme.surface, borderRadius: radius.md, padding: 4 },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  segActive: { backgroundColor: theme.primarySoft },
  segText: { color: theme.textDim, fontSize: 13 },
  dowRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dowText: { color: theme.textDim, fontWeight: '700' },
  rowInput: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  rowLabel: { color: theme.textDim },
  smallInput: {
    color: theme.text,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  fullInput: {
    color: theme.text,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  priRow: { flexDirection: 'row', gap: 8 },
  priBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priText: { color: theme.textDim, fontWeight: '700' },
  saveBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
});
