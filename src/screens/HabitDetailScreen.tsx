import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg';

import { ScreenHeader } from '../components/ScreenHeader';
import { computeStats, habitActiveOnDate, habitEntry, useStore } from '../store';
import { theme, radius } from '../theme';
import { fmtDate, parseDate } from '../utils/date';
import { RootStackParamList } from '../navigation';

const { width } = Dimensions.get('window');

type Tab = 'calendar' | 'stats' | 'edit';

export const HabitDetailScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'HabitDetail'>>();
  const { state, dispatch } = useStore();
  const habit = useMemo(
    () => state.habits.find((h) => h.id === route.params.habitId),
    [route.params.habitId, state.habits]
  );
  const [tab, setTab] = useState<Tab>('calendar');
  const [monthDate, setMonthDate] = useState(new Date());

  if (!habit) return null;
  const stats = computeStats(habit);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={habit.name}
        onBack={() => nav.goBack()}
        right={
          <Pressable hitSlop={8}>
            <MaterialCommunityIcons name="chart-line-variant" size={22} color={theme.primary} />
          </Pressable>
        }
      />
      <View style={styles.tabs}>
        {(['calendar', 'stats', 'edit'] as Tab[]).map((t) => (
          <Pressable key={t} style={styles.tabBtn} onPress={() => {
            if (t === 'edit') {
              nav.navigate('AddHabit', { habitId: habit.id });
              return;
            }
            setTab(t);
          }}>
            <Text style={[styles.tabText, tab === t && styles.tabActive]}>
              {t === 'calendar' ? 'Calendar' : t === 'stats' ? 'Statistics' : 'Edit'}
            </Text>
            {tab === t && <View style={styles.tabBar} />}
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {tab === 'calendar' && (
          <CalendarMonth
            habit={habit}
            monthDate={monthDate}
            setMonthDate={setMonthDate}
            onToggle={(d) => {
              const curr = habitEntry(habit, d);
              const next =
                curr.status === 'done' ? 'pending' :
                curr.status === 'pending' ? 'done' :
                curr.status === 'fail' ? 'pending' : 'done';
              dispatch({
                type: 'setEntry',
                habitId: habit.id,
                entry: { ...curr, status: next },
              });
            }}
          />
        )}

        {tab === 'stats' && (
          <>
            <MonthlyBars habit={habit} />
            <View style={styles.periodRow}>
              {['Week', 'Month', 'Year'].map((p, i) => (
                <Pressable key={p} style={[styles.period, i === 1 && styles.periodActive]}>
                  <Text style={[styles.periodText, i === 1 && { color: theme.primary }]}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.blockTitle}>Success / Fail</Text>
            <View style={styles.donutWrap}>
              <Donut
                done={stats.done}
                fail={stats.fail}
                pending={stats.pending}
              />
              <View style={styles.legend}>
                <LegendDot color={theme.success} label="Done" />
                <LegendDot color={theme.danger} label="Fail" />
                <LegendDot color={theme.warning} label="Pending" />
              </View>
            </View>

            <Text style={styles.blockTitle}>Streak</Text>
            <View style={styles.streakRow}>
              <View style={styles.streakCell}>
                <Text style={styles.streakLabel}>Current</Text>
                <Text style={styles.streakValue}>{stats.streak} DAYS</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakCell}>
                <Text style={styles.streakLabel}>Best</Text>
                <Text style={styles.streakValue}>{stats.best} DAYS</Text>
              </View>
            </View>

            <Text style={styles.blockTitle}>Times completed</Text>
            <TimesCompletedTable habit={habit} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14 }}>
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 6 }} />
    <Text style={{ color: theme.textDim, fontSize: 13 }}>{label}</Text>
  </View>
);

const Donut: React.FC<{ done: number; fail: number; pending: number }> = ({
  done,
  fail,
  pending,
}) => {
  const total = done + fail + pending || 1;
  const R = 80;
  const C = 2 * Math.PI * R;
  const doneLen = (done / total) * C;
  const failLen = (fail / total) * C;
  const pendLen = (pending / total) * C;
  return (
    <Svg width={200} height={200}>
      <G rotation={-90} origin="100, 100">
        <Circle cx={100} cy={100} r={R} stroke={theme.border} strokeWidth={20} fill="none" />
        <Circle
          cx={100} cy={100} r={R} stroke={theme.success} strokeWidth={20} fill="none"
          strokeDasharray={`${doneLen} ${C - doneLen}`} strokeDashoffset={0}
        />
        <Circle
          cx={100} cy={100} r={R} stroke={theme.danger} strokeWidth={20} fill="none"
          strokeDasharray={`${failLen} ${C - failLen}`} strokeDashoffset={-doneLen}
        />
        <Circle
          cx={100} cy={100} r={R} stroke={theme.warning} strokeWidth={20} fill="none"
          strokeDasharray={`${pendLen} ${C - pendLen}`} strokeDashoffset={-(doneLen + failLen)}
        />
      </G>
      <SvgText x={100} y={110} textAnchor="middle" fontSize={28} fontWeight="700" fill={theme.text}>
        {done}
      </SvgText>
    </Svg>
  );
};

const MonthlyBars: React.FC<{ habit: any }> = ({ habit }) => {
  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i);
  const counts = months.map((m) => {
    return Object.values(habit.entries).filter((e: any) => {
      const d = parseDate(e.date);
      return d.getFullYear() === year && d.getMonth() === m && e.status === 'done';
    }).length;
  });
  const max = Math.max(1, ...counts);
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
  const W = width - 32;
  const H = 180;
  const barW = W / 14;
  return (
    <Svg width={W} height={H}>
      {counts.map((c, i) => {
        const h = (c / max) * (H - 40);
        const x = i * (W / 12) + barW * 0.1;
        const y = H - 20 - h;
        return (
          <G key={i}>
            {c > 0 && (
              <SvgText x={x + barW * 0.4} y={y - 4} fontSize={10} fill={theme.textDim} textAnchor="middle">
                {c}
              </SvgText>
            )}
            <Rect x={x} y={y} width={barW * 0.8} height={h} fill={theme.primary} rx={3} />
            <SvgText x={x + barW * 0.4} y={H - 4} fontSize={10} fill={theme.textDim} textAnchor="middle">
              {labels[i]}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

const CalendarMonth: React.FC<{
  habit: any;
  monthDate: Date;
  setMonthDate: (d: Date) => void;
  onToggle: (d: Date) => void;
}> = ({ habit, monthDate, setMonthDate, onToggle }) => {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDow = first.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(y, m, d));

  const todayKey = fmtDate(new Date());

  // Summary counts for this month
  let doneCount = 0;
  let missedCount = 0;
  for (const d of cells) {
    if (!d) continue;
    const key = fmtDate(d);
    const scheduled = habitActiveOnDate(habit, d);
    const entry = habit.entries[key];
    const isPastOrToday = key <= todayKey;
    if (entry?.status === 'done') doneCount++;
    else if (
      scheduled && isPastOrToday && (!entry || entry.status === 'pending' || entry.status === 'fail')
    ) missedCount++;
  }

  return (
    <View>
      <View style={styles.calHeader}>
        <Pressable onPress={() => setMonthDate(new Date(y, m - 1, 1))}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={theme.primary} />
        </Pressable>
        <Text style={styles.calTitle}>
          {first.toLocaleString('default', { month: 'long' })} {y}
        </Text>
        <Pressable onPress={() => setMonthDate(new Date(y, m + 1, 1))}>
          <MaterialCommunityIcons name="chevron-right" size={26} color={theme.primary} />
        </Pressable>
      </View>

      {/* Legend */}
      <View style={styles.calLegend}>
        <LegendDot color={theme.success} label={`Done (${doneCount})`} />
        <LegendDot color={theme.danger} label={`Missed (${missedCount})`} />
        <LegendDot color={theme.textSubtle} label="Skipped" />
      </View>

      <View style={styles.dowRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Text key={i} style={styles.dowText}>{d}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={styles.dayCell} />;
          const key = fmtDate(d);
          const entry = habit.entries[key];
          const scheduled = habitActiveOnDate(habit, d);
          const isToday = key === todayKey;
          const isPast = key < todayKey;
          const isFuture = key > todayKey;

          // Decide bubble style
          let bg: string = 'transparent';
          let textColor = theme.text;
          let ring = false;
          let dim = false;

          if (entry?.status === 'done') {
            bg = theme.success;
            textColor = '#fff';
          } else if (entry?.status === 'skip') {
            bg = theme.textSubtle;
            textColor = '#fff';
          } else if (entry?.status === 'fail') {
            bg = theme.danger;
            textColor = '#fff';
          } else if (scheduled && (isPast || isToday) && !entry) {
            // Scheduled but missed / not logged yet on past or today
            if (isToday) {
              ring = true;
              textColor = theme.primary;
            } else {
              bg = theme.danger;
              textColor = '#fff';
            }
          } else if (scheduled && isFuture) {
            ring = true;
            textColor = theme.textDim;
          } else {
            // Not scheduled that day
            dim = true;
            textColor = theme.textSubtle;
          }

          return (
            <Pressable key={i} style={styles.dayCell} onPress={() => onToggle(d)}>
              <View
                style={[
                  styles.dayBubble,
                  { backgroundColor: bg },
                  ring && { borderWidth: 2, borderColor: isToday ? theme.primary : theme.border },
                  dim && { backgroundColor: theme.surface },
                  isToday && !entry && { borderColor: theme.primary, borderWidth: 2 },
                ]}
              >
                <Text style={[styles.dayText, { color: textColor }]}>{d.getDate()}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const TimesCompletedTable: React.FC<{ habit: any }> = ({ habit }) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const entries = Object.values(habit.entries) as any[];
  const done = entries.filter((e) => e.status === 'done');
  const thisWeek = done.filter((e) => parseDate(e.date) >= weekStart).length;
  const thisMonth = done.filter((e) => {
    const d = parseDate(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
  const thisYear = done.filter((e) => parseDate(e.date).getFullYear() === y).length;
  const all = done.length;

  const rows = [
    ['This week', thisWeek],
    ['This month', thisMonth],
    ['This year', thisYear],
    ['All', all],
  ] as const;
  return (
    <View style={styles.tcTable}>
      {rows.map(([k, v]) => (
        <View key={k} style={styles.tcRow}>
          <Text style={styles.tcLabel}>{k}</Text>
          <Text style={styles.tcValue}>{v}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { color: theme.textDim },
  tabActive: { color: theme.text, fontWeight: '700' },
  tabBar: {
    marginTop: 6,
    height: 3,
    width: 60,
    borderRadius: 2,
    backgroundColor: theme.primary,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 4,
    marginTop: 8,
  },
  period: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  periodActive: { backgroundColor: theme.primarySoft },
  periodText: { color: theme.textDim },
  blockTitle: { color: theme.text, marginTop: 24, marginBottom: 10, fontWeight: '700' },
  donutWrap: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 16,
  },
  legend: { flexDirection: 'row', marginTop: 10 },
  streakRow: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  streakCell: { flex: 1, alignItems: 'center' },
  streakDivider: { width: 1, backgroundColor: theme.border },
  streakLabel: { color: theme.textDim, fontSize: 13 },
  streakValue: { color: theme.primary, fontSize: 18, fontWeight: '700', marginTop: 4, letterSpacing: 1 },
  tcTable: { backgroundColor: theme.surface, borderRadius: radius.md, paddingHorizontal: 12 },
  tcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tcLabel: { color: theme.textDim, fontSize: 14 },
  tcValue: { color: theme.text, fontSize: 14, fontWeight: '700' },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calTitle: { color: theme.text, fontSize: 18, fontWeight: '700' },
  calLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 4,
  },
  dowRow: { flexDirection: 'row' },
  dowText: { color: theme.textDim, flex: 1, textAlign: 'center', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayBubble: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleEmpty: {
    backgroundColor: theme.surface,
  },
  dayText: { color: theme.text, fontWeight: '600' },
});
