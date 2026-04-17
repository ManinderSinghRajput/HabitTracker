import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { theme, type } from '../theme';
import { fullDate, longDate } from '../utils/date';

type Props = {
  onNavigate?: () => void;
};

export const DrawerContent: React.FC<Props> = ({ onNavigate }) => {
  const nav = useNavigation<any>();
  const now = new Date();
  const tabRoutes = new Set(['Today', 'Habits', 'Tasks', 'Categories', 'Timer']);

  const nav1 = (screen: string) => {
    if (tabRoutes.has(screen)) {
      nav.navigate('Drawer' as any, { screen });
    } else {
      nav.navigate(screen as any);
    }
    onNavigate?.();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.brand}>Ritual</Text>
          <Text style={styles.tagline}>Small rituals. Big days.</Text>
          <Text style={styles.dow}>{longDate(now)}</Text>
          <Text style={styles.date}>{fullDate(now)}</Text>
        </View>

        <Item icon="email-outline" label="News and events" onPress={() => onNavigate?.()} />
        <Separator />
        <Item icon="view-grid-outline" label="Categories" onPress={() => nav1('Categories')} />
        <Item icon="timer-outline" label="Timer" onPress={() => nav1('Timer')} />
        <Item icon="cash" label="Expenses" onPress={() => nav1('Expenses')} />
        <Item icon="note-text-outline" label="Notes" onPress={() => nav1('Notes')} />
        <Separator />
        <Item icon="palette-outline" label="Customize" onPress={() => nav1('Settings')} />
        <Item icon="tune-vertical" label="Settings" onPress={() => nav1('Settings')} />
        <Item icon="cloud-upload-outline" label="Account and Backups" onPress={() => onNavigate?.()} />
        <Separator />
        <Item icon="seal-variant" label="Premium" onPress={() => onNavigate?.()} />
        <Item icon="star-outline" label="Rate this app" onPress={() => onNavigate?.()} />
        <Item icon="message-alert-outline" label="Contact us" onPress={() => onNavigate?.()} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Item: React.FC<{ icon: string; label: string; onPress: () => void }> = ({
  icon,
  label,
  onPress,
}) => (
  <Pressable style={styles.item} onPress={onPress}>
    <MaterialCommunityIcons name={icon as any} size={22} color={theme.text} />
    <Text style={styles.itemLabel}>{label}</Text>
  </Pressable>
);

const Separator = () => <View style={styles.sep} />;

const styles = StyleSheet.create({
  header: { padding: 20, paddingBottom: 14 },
  brand: {
    ...type.display,
    color: theme.primary,
  },
  tagline: {
    ...type.caption,
    color: theme.textDim,
    marginTop: 2,
    marginBottom: 12,
  },
  dow: { ...type.title, color: theme.text, fontSize: 18, marginTop: 4 },
  date: { ...type.caption, color: theme.textDim, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  itemLabel: { ...type.body, color: theme.text },
  sep: { height: 1, backgroundColor: theme.border, marginVertical: 6, marginHorizontal: 20 },
});
