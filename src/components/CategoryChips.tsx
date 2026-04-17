import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, radius } from '../theme';
import { resolveIconName } from '../utils/icons';

type Item = { id: string; name: string; icon?: string; color?: string };

type Props = {
  items: Item[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export const CategoryChips: React.FC<Props> = ({ items, selectedId, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {items.map((it) => {
        const active = it.id === selectedId;
        const accent = it.color ?? theme.primary;
        return (
          <Pressable
            key={it.id}
            onPress={() => onSelect(it.id)}
            style={[
              styles.chip,
              active && {
                backgroundColor: accent + '33',
                borderColor: accent + '33',
              },
            ]}
          >
            {it.icon ? (
              <MaterialCommunityIcons
                name={resolveIconName(it.icon) as any}
                size={16}
                color={active ? accent : theme.textDim}
                style={{ marginRight: 6 }}
              />
            ) : null}
            <Text
              style={[
                styles.chipText,
                { color: active ? accent : theme.textDim },
              ]}
            >
              {it.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    height: 44,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    gap: 8,
  },
  chip: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
