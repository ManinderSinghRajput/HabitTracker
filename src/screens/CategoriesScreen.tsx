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
import { IconBadge } from '../components/IconBadge';
import { useAppDrawer } from '../drawer';
import { useStore } from '../store';
import { theme, radius } from '../theme';

export const CategoriesScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { openDrawer, available } = useAppDrawer();
  const { state } = useStore();

  const customs = useMemo(
    () => state.categories.filter((c) => !c.isDefault),
    [state.categories]
  );
  const defaults = useMemo(
    () => state.categories.filter((c) => c.isDefault),
    [state.categories]
  );

  const entriesInCategory = (id: string) =>
    state.habits.filter((h) => h.categoryId === id).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Categories"
        onMenu={available ? openDrawer : undefined}
        onBack={!available && nav.canGoBack() ? () => nav.goBack() : undefined}
        right={
          <Pressable hitSlop={8}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={theme.text}
            />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.section}>Custom categories</Text>
        <View style={styles.grid}>
          {customs.map((c) => (
            <CategoryTile
              key={c.id}
              name={c.name}
              icon={c.icon}
              color={c.color}
              count={entriesInCategory(c.id)}
              onPress={() =>
                nav.navigate('NewCategory', { categoryId: c.id })
              }
            />
          ))}
        </View>

        <Text style={[styles.section, { marginTop: 24 }]}>Default categories</Text>
        <View style={styles.grid}>
          {defaults.map((c) => (
            <CategoryTile
              key={c.id}
              name={c.name}
              icon={c.icon}
              color={c.color}
              count={entriesInCategory(c.id)}
              onPress={() => {}}
            />
          ))}
        </View>
      </ScrollView>

      <Pressable style={styles.newBtn} onPress={() => nav.navigate('NewCategory')}>
        <Text style={styles.newBtnText}>NEW CATEGORY</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const CategoryTile: React.FC<{
  name: string;
  icon: string;
  color: string;
  count: number;
  onPress: () => void;
}> = ({ name, icon, color, count, onPress }) => (
  <Pressable onPress={onPress} style={styles.tile}>
    <IconBadge icon={icon} color={color} size={64} iconSize={34} />
    <Text style={styles.tileName} numberOfLines={1}>
      {name}
    </Text>
    <Text style={styles.tileCount}>{count} entries</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  section: {
    color: theme.text,
    fontSize: 15,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tile: {
    width: 88,
    alignItems: 'center',
  },
  tileName: {
    color: theme.text,
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
  },
  tileCount: {
    color: theme.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  newBtn: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newBtnText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
