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
import { Category } from '../types';
import { theme, radius, palette } from '../theme';
import { uid } from '../utils/id';
import { resolveIconName } from '../utils/icons';
import { RootStackParamList } from '../navigation';

const ICONS = [
  'shape-outline', 'silverware-fork-knife', 'run', 'dumbbell', 'book-open-variant',
  'meditation', 'water', 'cash', 'music', 'palette', 'heart',
  'star', 'trophy', 'trending-up', 'language-python', 'pencil',
];

export const NewCategoryScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'NewCategory'>>();
  const { state, dispatch } = useStore();
  const editing = useMemo(
    () => state.categories.find((c) => c.id === route.params?.categoryId),
    [route.params?.categoryId, state.categories]
  );

  const [name, setName] = useState(editing?.name ?? '');
  const [icon, setIcon] = useState(editing?.icon ?? 'shape-outline');
  const [color, setColor] = useState(editing?.color ?? palette[0]);

  const save = () => {
    if (!name.trim()) return;
    const cat: Category = {
      id: editing?.id ?? uid(),
      name: name.trim(),
      icon,
      color,
      isDefault: editing?.isDefault,
    };
    dispatch({ type: editing ? 'updateCategory' : 'addCategory', category: cat });
    nav.goBack();
  };

  const del = () => {
    if (editing && !editing.isDefault) {
      dispatch({ type: 'deleteCategory', id: editing.id });
    }
    nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={editing ? 'Edit category' : 'New category'}
        onBack={() => nav.goBack()}
        right={
          editing && !editing.isDefault ? (
            <Pressable onPress={del} hitSlop={8}>
              <MaterialCommunityIcons name="delete" size={22} color={theme.danger} />
            </Pressable>
          ) : null
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.preview}>
          <IconBadge icon={icon} color={color} size={80} iconSize={44} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Category name"
            placeholderTextColor={theme.textSubtle}
            style={styles.name}
          />
        </View>

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
              <MaterialCommunityIcons name={resolveIconName(i) as any} size={24} color={color} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Color</Text>
        <View style={styles.colorRow}>
          {palette.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.color,
                { backgroundColor: c },
                color === c && { borderWidth: 3, borderColor: '#fff' },
              ]}
            />
          ))}
        </View>

        <Pressable style={[styles.saveBtn, { backgroundColor: color }]} onPress={save}>
          <Text style={styles.saveText}>{editing ? 'UPDATE' : 'SAVE'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    marginTop: 14,
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingVertical: 10,
  },
  section: { color: theme.textDim, marginTop: 16, marginBottom: 8, fontWeight: '600' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  color: { width: 36, height: 36, borderRadius: 18 },
  saveBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
});
