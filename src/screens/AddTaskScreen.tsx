import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { ScreenHeader } from '../components/ScreenHeader';
import { useStore } from '../store';
import { Task } from '../types';
import { theme, radius } from '../theme';
import { uid } from '../utils/id';
import { fmtDate } from '../utils/date';
import { RootStackParamList } from '../navigation';

export const AddTaskScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddTask'>>();
  const { state, dispatch } = useStore();
  const editing = useMemo(
    () => state.tasks.find((t) => t.id === route.params?.taskId),
    [route.params?.taskId, state.tasks]
  );

  const [title, setTitle] = useState(editing?.title ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [dueDate, setDueDate] = useState(editing?.dueDate ?? fmtDate(new Date()));
  const [dueTime, setDueTime] = useState(editing?.dueTime ?? '');
  const [isRecurring, setIsRecurring] = useState(!!editing?.recurring);
  const [priority, setPriority] = useState(editing?.priority ?? 3);

  const save = () => {
    if (!title.trim()) return;
    const task: Task = {
      id: editing?.id ?? uid(),
      title: title.trim(),
      notes: notes.trim() || undefined,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      recurring: isRecurring ? { kind: 'daily' } : undefined,
      priority,
      completed: editing?.completed ?? false,
      completedDates: editing?.completedDates ?? [],
      createdAt: editing?.createdAt ?? Date.now(),
    };
    dispatch({ type: editing ? 'updateTask' : 'addTask', task });
    nav.goBack();
  };

  const del = () => {
    if (editing) dispatch({ type: 'deleteTask', id: editing.id });
    nav.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={editing ? 'Edit task' : 'New task'}
        onBack={() => nav.goBack()}
        right={
          editing ? (
            <Pressable onPress={del} hitSlop={8}>
              <MaterialCommunityIcons name="delete" size={22} color={theme.danger} />
            </Pressable>
          ) : null
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
          placeholderTextColor={theme.textSubtle}
          style={styles.input}
        />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes (optional)"
          placeholderTextColor={theme.textSubtle}
          multiline
          style={[styles.input, { minHeight: 80, marginTop: 10 }]}
        />

        <Text style={styles.section}>Due date (YYYY-MM-DD)</Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-04-16"
          placeholderTextColor={theme.textSubtle}
          style={styles.input}
        />

        <Text style={styles.section}>Due time (HH:mm)</Text>
        <TextInput
          value={dueTime}
          onChangeText={setDueTime}
          placeholder="09:30"
          placeholderTextColor={theme.textSubtle}
          style={styles.input}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Recurring task (daily)</Text>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            thumbColor={isRecurring ? theme.primary : '#ccc'}
          />
        </View>

        <Text style={styles.section}>Priority</Text>
        <View style={styles.priRow}>
          {[1, 2, 3, 4, 5].map((p) => (
            <Pressable
              key={p}
              style={[
                styles.priBtn,
                priority === p && { backgroundColor: theme.primarySoft, borderColor: theme.primary },
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priText, priority === p && { color: theme.primary }]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveText}>{editing ? 'UPDATE' : 'SAVE'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  input: {
    color: theme.text,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  section: { color: theme.textDim, marginTop: 16, marginBottom: 6, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  switchLabel: { color: theme.text },
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
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
});
