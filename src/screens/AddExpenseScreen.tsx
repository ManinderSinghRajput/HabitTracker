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
import { useStore } from '../store';
import { Expense } from '../types';
import { theme, radius } from '../theme';
import { uid } from '../utils/id';
import { fmtDate } from '../utils/date';
import { resolveIconName } from '../utils/icons';
import { RootStackParamList } from '../navigation';

export const AddExpenseScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddExpense'>>();
  const { state, dispatch } = useStore();
  const editing = useMemo(
    () => state.expenses.find((e) => e.id === route.params?.expenseId),
    [route.params?.expenseId, state.expenses]
  );

  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [note, setNote] = useState(editing?.note ?? '');
  const [categoryId, setCategoryId] = useState(
    editing?.categoryId ?? state.categories[0]?.id ?? ''
  );
  const [date, setDate] = useState(editing?.date ?? fmtDate(new Date()));

  const save = () => {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt)) return;
    const expense: Expense = {
      id: editing?.id ?? uid(),
      amount: amt,
      note: note || undefined,
      categoryId,
      date,
      createdAt: editing?.createdAt ?? Date.now(),
    };
    dispatch({ type: editing ? 'updateExpense' : 'addExpense', expense });
    nav.goBack();
  };

  const del = () => {
    if (editing) dispatch({ type: 'deleteExpense', id: editing.id });
    nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={editing ? 'Edit expense' : 'New expense'}
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
        <Text style={styles.label}>Amount ({state.settings.currency})</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          placeholderTextColor={theme.textSubtle}
          style={styles.amountInput}
        />

        <Text style={styles.label}>Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Groceries"
          placeholderTextColor={theme.textSubtle}
          style={styles.input}
        />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2026-04-16"
          placeholderTextColor={theme.textSubtle}
          style={styles.input}
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 6 }}>
            {state.categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
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
                  style={{
                    color: categoryId === c.id ? c.color : theme.textDim,
                    fontWeight: '600',
                  }}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveText}>{editing ? 'UPDATE' : 'SAVE'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  label: { color: theme.textDim, marginTop: 14, marginBottom: 6, fontWeight: '600' },
  input: {
    color: theme.text,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  amountInput: {
    color: theme.text,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
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
  saveBtn: {
    marginTop: 24,
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
});
