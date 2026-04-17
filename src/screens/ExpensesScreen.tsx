import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../components/ScreenHeader';
import { FAB } from '../components/FAB';
import { IconBadge } from '../components/IconBadge';
import { useStore } from '../store';
import { theme, radius } from '../theme';
import { parseDate } from '../utils/date';

export const ExpensesScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, dispatch } = useStore();

  const total = useMemo(
    () => state.expenses.reduce((sum, e) => sum + e.amount, 0),
    [state.expenses]
  );
  const thisMonth = useMemo(() => {
    const now = new Date();
    return state.expenses
      .filter((e) => {
        const d = parseDate(e.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [state.expenses]);

  const currency = state.settings.currency;

  const grouped = useMemo(() => {
    const g: Record<string, typeof state.expenses> = {};
    for (const e of state.expenses) {
      (g[e.date] ??= []).push(e);
    }
    return Object.entries(g).sort(([a], [b]) => b.localeCompare(a));
  }, [state.expenses]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader title="Expenses" onBack={() => nav.goBack()} />
      <View style={styles.summary}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>This month</Text>
          <Text style={styles.cardValue}>
            {currency}
            {thisMonth.toFixed(2)}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total</Text>
          <Text style={styles.cardValue}>
            {currency}
            {total.toFixed(2)}
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {grouped.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cash-remove" size={64} color={theme.textSubtle} />
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySub}>Tap + to log your first expense</Text>
          </View>
        ) : (
          grouped.map(([date, items]) => (
            <View key={date} style={{ marginBottom: 14 }}>
              <Text style={styles.dateHeader}>{date}</Text>
              {items.map((e) => {
                const cat = state.categories.find((c) => c.id === e.categoryId);
                return (
                  <Pressable
                    key={e.id}
                    style={styles.row}
                    onPress={() => nav.navigate('AddExpense', { expenseId: e.id })}
                    onLongPress={() => dispatch({ type: 'deleteExpense', id: e.id })}
                  >
                    <IconBadge
                      icon={cat?.icon ?? 'cash'}
                      color={cat?.color ?? theme.accentRed}
                      size={40}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.title}>{e.note || cat?.name || 'Expense'}</Text>
                      {cat && <Text style={styles.sub}>{cat.name}</Text>}
                    </View>
                    <Text style={styles.amt}>
                      {currency}
                      {e.amount.toFixed(2)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
      <FAB onPress={() => nav.navigate('AddExpense')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  card: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 14,
  },
  cardLabel: { color: theme.textDim, fontSize: 13 },
  cardValue: { color: theme.text, fontSize: 22, fontWeight: '700', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: theme.text, fontSize: 16, fontWeight: '700', marginTop: 10 },
  emptySub: { color: theme.textDim, marginTop: 4 },
  dateHeader: { color: theme.textDim, marginBottom: 6, fontSize: 13, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 6,
  },
  title: { color: theme.text, fontSize: 15, fontWeight: '600' },
  sub: { color: theme.textDim, fontSize: 12, marginTop: 2 },
  amt: { color: theme.primary, fontWeight: '700', fontSize: 15 },
});
