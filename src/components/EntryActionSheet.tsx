import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconBadge } from './IconBadge';
import { Habit, EntryStatus, HabitEntry } from '../types';
import { theme, radius } from '../theme';
import { fmtDate } from '../utils/date';

type Props = {
  habit: Habit | null;
  date: Date;
  onClose: () => void;
  onSetStatus: (status: EntryStatus, note?: string) => void;
  onReset: () => void;
  onOpenDetail: () => void;
  currentEntry?: HabitEntry;
};

export const EntryActionSheet: React.FC<Props> = ({
  habit,
  date,
  onClose,
  onSetStatus,
  onReset,
  onOpenDetail,
  currentEntry,
}) => {
  const [note, setNote] = React.useState<string>(currentEntry?.note ?? '');
  const [showNote, setShowNote] = React.useState(false);

  React.useEffect(() => {
    setNote(currentEntry?.note ?? '');
    setShowNote(false);
  }, [currentEntry?.note, habit?.id]);

  if (!habit) return null;

  const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1
  ).padStart(2, '0')}/${date.getFullYear()}`;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{habit.name}</Text>
            <View
              style={[
                styles.tag,
                { backgroundColor: habit.color + '22' },
              ]}
            >
              <Text style={[styles.tagText, { color: habit.color }]}>
                {dateStr}
              </Text>
            </View>
          </View>
          <IconBadge icon={habit.icon} color={habit.color} size={44} />
        </View>

        <View style={styles.statusRow}>
          <StatusBtn
            label="Pending"
            icon="bell-outline"
            active={currentEntry?.status === 'pending' || !currentEntry}
            color={theme.textDim}
            onPress={() => onSetStatus('pending', note || undefined)}
          />
          <StatusBtn
            label="Done"
            icon="check"
            active={currentEntry?.status === 'done'}
            color={theme.success}
            onPress={() => onSetStatus('done', note || undefined)}
          />
          <StatusBtn
            label="Fail"
            icon="close"
            active={currentEntry?.status === 'fail'}
            color={theme.danger}
            onPress={() => onSetStatus('fail', note || undefined)}
          />
        </View>

        <ActionBtn
          icon="bell-off-outline"
          label="Add reminder ..."
          onPress={onOpenDetail}
        />
        <Pressable onPress={() => setShowNote((s) => !s)}>
          <ActionBtn icon="message-text-outline" label="Add note ..." />
        </Pressable>
        {showNote && (
          <View style={styles.noteWrap}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Write note..."
              placeholderTextColor={theme.textSubtle}
              style={styles.noteInput}
              multiline
            />
            <Pressable
              onPress={() =>
                onSetStatus(currentEntry?.status ?? 'pending', note || undefined)
              }
              style={styles.saveBtn}
            >
              <Text style={styles.saveText}>Save note</Text>
            </Pressable>
          </View>
        )}

        <ActionBtn
          icon="minus-circle-outline"
          label="Skip"
          onPress={() => onSetStatus('skip')}
        />
        <ActionBtn icon="restart" label="Reset entry" onPress={onReset} />

        <View style={styles.footer}>
          <Pressable style={styles.footerBtn} onPress={onOpenDetail}>
            <MaterialCommunityIcons
              name="calendar"
              size={22}
              color={theme.text}
            />
          </Pressable>
          <Pressable style={styles.footerBtn} onPress={onOpenDetail}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={22}
              color={theme.text}
            />
          </Pressable>
          <Pressable style={styles.footerBtn} onPress={onOpenDetail}>
            <MaterialCommunityIcons
              name="pencil"
              size={22}
              color={theme.text}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const StatusBtn: React.FC<{
  label: string;
  icon: string;
  active: boolean;
  color: string;
  onPress: () => void;
}> = ({ label, icon, active, color, onPress }) => (
  <Pressable onPress={onPress} style={styles.statusBtn}>
    <View
      style={[
        styles.statusDot,
        active && { borderColor: color, backgroundColor: color + '22' },
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color={active ? color : theme.textDim}
      />
    </View>
    <Text style={[styles.statusLabel, active && { color }]}>{label}</Text>
  </Pressable>
);

const ActionBtn: React.FC<{
  icon: string;
  label: string;
  onPress?: () => void;
}> = ({ icon, label, onPress }) => (
  <Pressable style={styles.actionBtn} onPress={onPress}>
    <MaterialCommunityIcons
      name={icon as any}
      size={22}
      color={theme.textDim}
    />
    <Text style={styles.actionLabel}>{label}</Text>
  </Pressable>
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
    backgroundColor: theme.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { color: theme.text, fontSize: 20, fontWeight: '700' },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  tagText: { fontSize: 12, fontWeight: '600' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusBtn: { alignItems: 'center', flex: 1 },
  statusDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statusLabel: { color: theme.textDim, fontSize: 13 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  actionLabel: { color: theme.text, fontSize: 15 },
  noteWrap: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: radius.md,
    padding: 10,
    marginVertical: 8,
  },
  noteInput: {
    color: theme.text,
    minHeight: 60,
    fontSize: 14,
  },
  saveBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: theme.primary,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  saveText: { color: '#fff', fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  footerBtn: { padding: 8 },
});
