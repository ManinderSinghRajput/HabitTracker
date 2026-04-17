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
import { Note } from '../types';
import { theme, radius } from '../theme';
import { uid } from '../utils/id';
import { RootStackParamList } from '../navigation';

const NOTE_COLORS = [
  '#3A2F5B', '#2F4F3A', '#5B2F2F', '#5B4F2F',
  '#2F3F5B', '#4F2F5B', '#18181B', '#3F3F46',
];

export const AddNoteScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddNote'>>();
  const { state, dispatch } = useStore();
  const editing = useMemo(
    () => state.notes.find((n) => n.id === route.params?.noteId),
    [route.params?.noteId, state.notes]
  );

  const [title, setTitle] = useState(editing?.title ?? '');
  const [body, setBody] = useState(editing?.body ?? '');
  const [color, setColor] = useState(editing?.color ?? NOTE_COLORS[0]);
  const [pinned, setPinned] = useState(editing?.pinned ?? false);

  const save = () => {
    if (!title.trim() && !body.trim()) {
      nav.goBack();
      return;
    }
    const note: Note = {
      id: editing?.id ?? uid(),
      title: title.trim(),
      body: body.trim(),
      color,
      pinned,
      createdAt: editing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: editing ? 'updateNote' : 'addNote', note });
    nav.goBack();
  };

  const del = () => {
    if (editing) dispatch({ type: 'deleteNote', id: editing.id });
    nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color }} edges={['top']}>
      <ScreenHeader
        title={editing ? 'Edit note' : 'New note'}
        onBack={save}
        right={
          <>
            <Pressable onPress={() => setPinned((p) => !p)} hitSlop={8}>
              <MaterialCommunityIcons
                name={pinned ? 'pin' : 'pin-outline'}
                size={22}
                color={theme.text}
              />
            </Pressable>
            {editing ? (
              <Pressable onPress={del} hitSlop={8}>
                <MaterialCommunityIcons name="delete" size={22} color={theme.danger} />
              </Pressable>
            ) : null}
          </>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.textSubtle}
          style={styles.title}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Start writing..."
          placeholderTextColor={theme.textSubtle}
          multiline
          style={styles.body}
        />

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {NOTE_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.color,
                { backgroundColor: c },
                color === c && { borderWidth: 2, borderColor: '#fff' },
              ]}
            />
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
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 10,
  },
  body: {
    color: theme.text,
    fontSize: 16,
    minHeight: 240,
    textAlignVertical: 'top',
  },
  label: { color: theme.textDim, marginTop: 16, marginBottom: 6, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  color: { width: 32, height: 32, borderRadius: 16 },
  saveBtn: {
    marginTop: 24,
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
});
