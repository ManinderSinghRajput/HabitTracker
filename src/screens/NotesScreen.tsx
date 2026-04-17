import React from 'react';
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
import { useStore } from '../store';
import { theme, radius } from '../theme';

export const NotesScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, dispatch } = useStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader title="Notes" onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {state.notes.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="note-edit-outline" size={64} color={theme.textSubtle} />
            <Text style={styles.emptyTitle}>No notes</Text>
            <Text style={styles.emptySub}>Tap + to create your first note</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {state.notes.map((n) => (
              <Pressable
                key={n.id}
                style={[styles.card, { backgroundColor: n.color ?? theme.surface }]}
                onPress={() => nav.navigate('AddNote', { noteId: n.id })}
                onLongPress={() => dispatch({ type: 'deleteNote', id: n.id })}
              >
                {n.pinned && (
                  <MaterialCommunityIcons
                    name="pin"
                    size={14}
                    color={theme.text}
                    style={{ alignSelf: 'flex-end' }}
                  />
                )}
                <Text style={styles.noteTitle} numberOfLines={1}>{n.title || 'Untitled'}</Text>
                <Text style={styles.noteBody} numberOfLines={6}>{n.body}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <FAB onPress={() => nav.navigate('AddNote')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { color: theme.text, fontSize: 16, fontWeight: '700', marginTop: 10 },
  emptySub: { color: theme.textDim, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%',
    borderRadius: radius.md,
    padding: 12,
    minHeight: 120,
  },
  noteTitle: { color: theme.text, fontWeight: '700', fontSize: 15, marginBottom: 6 },
  noteBody: { color: theme.textDim, fontSize: 13 },
});
