import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, radius, type } from '../theme';
import { fmtDate } from '../utils/date';

/**
 * Day states rendered on the calendar:
 *   'done'    — accent green fill
 *   'missed'  — red fill (only for dates strictly in the past)
 *   'skip'    — gray fill
 *   'pending' — today, still has time (accent outline)
 *   'future'  — subtle outlined
 *   'off'     — not scheduled (dim)
 */
export type HistoryStatus = 'done' | 'missed' | 'skip' | 'pending' | 'future' | 'off';

export type HistoryCalendarProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onPressDay?: (date: Date) => void;
  getStatus: (date: Date) => HistoryStatus;
  /**
   * Optional controlled month. If provided, the parent owns the month state
   * and the calendar keeps its position across close/reopen.
   */
  monthDate?: Date;
  onMonthChange?: (d: Date) => void;
};

export const HistoryCalendar: React.FC<HistoryCalendarProps> = ({
  visible,
  title,
  onClose,
  onPressDay,
  getStatus,
  monthDate: controlledMonth,
  onMonthChange,
}) => {
  // Lazy-init so reopening preserves the last viewed month within a session,
  // even when the parent doesn't control it.
  const fallbackRef = React.useRef<Date>(new Date());
  const [, bump] = React.useReducer((x: number) => x + 1, 0);
  const monthDate = controlledMonth ?? fallbackRef.current;

  const setMonth = (d: Date) => {
    if (onMonthChange) {
      onMonthChange(d);
    } else {
      fallbackRef.current = d;
      bump(); // nudge re-render when uncontrolled
    }
  };

  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDow = first.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(y, m, d));

  let doneCount = 0;
  let missedCount = 0;
  for (const d of cells) {
    if (!d) continue;
    const s = getStatus(d);
    if (s === 'done') doneCount++;
    else if (s === 'missed') missedCount++;
  }

  const todayKey = fmtDate(new Date());

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
          <View style={styles.calHeader}>
            <Pressable onPress={() => setMonth(new Date(y, m - 1, 1))} hitSlop={8}>
              <MaterialCommunityIcons name="chevron-left" size={26} color={theme.primary} />
            </Pressable>
            <Text style={styles.calTitle}>
              {first.toLocaleString('default', { month: 'long' })} {y}
            </Text>
            <Pressable onPress={() => setMonth(new Date(y, m + 1, 1))} hitSlop={8}>
              <MaterialCommunityIcons name="chevron-right" size={26} color={theme.primary} />
            </Pressable>
          </View>

          <View style={styles.legend}>
            <LegendDot color={theme.success} label={`Done (${doneCount})`} />
            <LegendDot color={theme.danger} label={`Missed (${missedCount})`} />
            <LegendDot color={theme.textSubtle} label="Skipped" />
            <LegendDot color={theme.primary} label="Pending" ring />
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
              const isToday = key === todayKey;
              const s = getStatus(d);

              let bg = 'transparent';
              let textColor = theme.text;
              let ring = false;
              let ringColor = theme.border;

              if (s === 'done') {
                bg = theme.success;
                textColor = '#fff';
              } else if (s === 'missed') {
                bg = theme.danger;
                textColor = '#fff';
              } else if (s === 'skip') {
                bg = theme.textSubtle;
                textColor = '#fff';
              } else if (s === 'pending') {
                ring = true;
                ringColor = theme.primary;
                textColor = theme.text;
              } else if (s === 'future') {
                ring = true;
                textColor = theme.textDim;
              } else {
                bg = theme.surface;
                textColor = theme.textSubtle;
              }

              return (
                <Pressable
                  key={i}
                  style={styles.dayCell}
                  onPress={() => onPressDay?.(d)}
                  disabled={!onPressDay}
                >
                  <View
                    style={[
                      styles.dayBubble,
                      { backgroundColor: bg },
                      ring && { borderWidth: 2, borderColor: ringColor },
                      // Today marker only when not already ringed as pending.
                      isToday && !ring && { borderWidth: 2, borderColor: theme.primary },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: textColor }]}>{d.getDate()}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const LegendDot: React.FC<{ color: string; label: string; ring?: boolean }> = ({ color, label, ring }) => (
  <View style={styles.legendItem}>
    <View
      style={[
        styles.legendSwatch,
        ring
          ? { borderWidth: 2, borderColor: color, backgroundColor: 'transparent' }
          : { backgroundColor: color },
      ]}
    />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: theme.surfaceElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    ...type.title,
    color: theme.text,
    flex: 1,
    marginRight: 10,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  calTitle: { ...type.title, fontSize: 16, color: theme.text },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  legendSwatch: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendLabel: { color: theme.textDim, fontSize: 13 },
  dowRow: { flexDirection: 'row' },
  dowText: {
    color: theme.textDim,
    flex: 1,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
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
  dayText: { fontWeight: '600' },
});
