import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../components/ScreenHeader';
import { useStore } from '../store';
import { theme, radius, palette } from '../theme';

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, dispatch } = useStore();
  const s = state.settings;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader title="Settings" onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.section}>Currency symbol</Text>
        <TextInput
          value={s.currency}
          onChangeText={(v) => dispatch({ type: 'updateSettings', patch: { currency: v } })}
          style={styles.input}
        />

        <Text style={styles.section}>First day of week</Text>
        <View style={styles.row}>
          {(['Sunday', 'Monday'] as const).map((lbl, idx) => (
            <Pressable
              key={lbl}
              style={[styles.seg, s.firstDayOfWeek === idx && styles.segActive]}
              onPress={() =>
                dispatch({ type: 'updateSettings', patch: { firstDayOfWeek: idx as 0 | 1 } })
              }
            >
              <Text
                style={[
                  styles.segText,
                  s.firstDayOfWeek === idx && { color: theme.primary },
                ]}
              >
                {lbl}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Accent color</Text>
        <View style={styles.paletteRow}>
          {palette.map((c) => (
            <Pressable
              key={c}
              onPress={() => dispatch({ type: 'updateSettings', patch: { accentColor: c } })}
              style={[
                styles.color,
                { backgroundColor: c },
                s.accentColor === c && { borderWidth: 3, borderColor: '#fff' },
              ]}
            />
          ))}
        </View>

        <Text style={styles.section}>About</Text>
        <View style={styles.about}>
          <MaterialCommunityIcons name="information-outline" size={22} color={theme.textDim} />
          <Text style={{ color: theme.textDim, marginLeft: 10 }}>
            HabitNow v1.0.0 — all data is stored locally on your device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  section: { color: theme.textDim, marginTop: 16, marginBottom: 8, fontWeight: '600' },
  input: {
    color: theme.text,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  row: { flexDirection: 'row', backgroundColor: theme.surface, borderRadius: radius.md, padding: 4 },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  segActive: { backgroundColor: theme.primarySoft },
  segText: { color: theme.textDim },
  paletteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  color: { width: 32, height: 32, borderRadius: 16 },
  about: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 12,
  },
});
