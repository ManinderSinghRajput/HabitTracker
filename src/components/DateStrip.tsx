import React, { useMemo } from 'react';
import { ScrollView, Pressable, View, Text, StyleSheet } from 'react-native';
import { theme, radius } from '../theme';
import { addDays, fmtDate, sameDay, weekdayShort } from '../utils/date';

type Props = {
  selected: Date;
  onSelect: (d: Date) => void;
  daysBefore?: number;
  daysAfter?: number;
};

export const DateStrip: React.FC<Props> = ({
  selected,
  onSelect,
  daysBefore = 30,
  daysAfter = 30,
}) => {
  const today = new Date();
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = -daysBefore; i <= daysAfter; i++) {
      arr.push(addDays(today, i));
    }
    return arr;
  }, [daysBefore, daysAfter]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {days.map((d) => {
        const active = sameDay(d, selected);
        const isToday = sameDay(d, today);
        return (
          <Pressable key={fmtDate(d)} onPress={() => onSelect(d)} style={styles.cellWrap}>
            <View style={[styles.cell, active && styles.cellActive, !active && isToday && styles.cellToday]}>
              <Text style={[styles.dow, active && styles.textActive]}>
                {weekdayShort(d)}
              </Text>
              <Text style={[styles.date, active && styles.textActive]}>
                {d.getDate()}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    height: 90,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  cellWrap: { marginRight: 8 },
  cell: {
    width: 58,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellActive: {
    backgroundColor: theme.primary,
  },
  cellToday: {
    borderColor: theme.primary + '55',
  },
  dow: {
    color: theme.textDim,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  date: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  textActive: { color: '#fff' },
});
