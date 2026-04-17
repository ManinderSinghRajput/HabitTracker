import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAppDrawer } from '../drawer';
import { theme, radius } from '../theme';

type Mode = 'stopwatch' | 'countdown' | 'intervals';

export const TimerScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { openDrawer, available } = useAppDrawer();
  const [mode, setMode] = useState<Mode>('stopwatch');
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState(60); // seconds
  const [workSec, setWorkSec] = useState(30);
  const [restSec, setRestSec] = useState(10);
  const [phase, setPhase] = useState<'work' | 'rest'>('work');
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setMs((prev) => {
        const next = prev + 100;
        if (mode === 'countdown') {
          if (next >= target * 1000) {
            setRunning(false);
            return target * 1000;
          }
        }
        if (mode === 'intervals') {
          const limit = (phase === 'work' ? workSec : restSec) * 1000;
          if (next >= limit) {
            setPhase(phase === 'work' ? 'rest' : 'work');
            return 0;
          }
        }
        return next;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [running, mode, target, workSec, restSec, phase]);

  const reset = () => {
    setRunning(false);
    setMs(0);
    setPhase('work');
  };

  const displayMs =
    mode === 'countdown' ? Math.max(0, target * 1000 - ms) : ms;
  const totalSec = Math.floor(displayMs / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Timer"
        onMenu={available ? openDrawer : undefined}
        onBack={!available && nav.canGoBack() ? () => nav.goBack() : undefined}
        right={
          <>
            <Pressable hitSlop={8}>
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={theme.text}
              />
            </Pressable>
            <Pressable hitSlop={8}>
              <MaterialCommunityIcons
                name="vibrate"
                size={22}
                color={theme.text}
              />
            </Pressable>
            <Pressable hitSlop={8}>
              <MaterialCommunityIcons
                name="volume-high"
                size={22}
                color={theme.text}
              />
            </Pressable>
          </>
        }
      />

      <View style={styles.center}>
        <View style={styles.ring}>
          <Text style={styles.time}>{`${mm}:${ss}`}</Text>
          {mode === 'intervals' && (
            <Text style={styles.phase}>
              {phase === 'work' ? 'WORK' : 'REST'}
            </Text>
          )}
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={() => setRunning((r) => !r)}
            style={[styles.startBtn, running && { backgroundColor: theme.warning }]}
          >
            <MaterialCommunityIcons
              name={running ? 'pause' : 'play'}
              size={22}
              color="#fff"
            />
            <Text style={styles.startText}>{running ? 'PAUSE' : 'START'}</Text>
          </Pressable>
          <Pressable onPress={reset} style={styles.resetBtn}>
            <MaterialCommunityIcons name="restart" size={22} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.modeRow}>
          {(['stopwatch', 'countdown', 'intervals'] as Mode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeActive]}
              onPress={() => {
                setMode(m);
                reset();
              }}
            >
              <MaterialCommunityIcons
                name={
                  m === 'stopwatch'
                    ? 'timer-outline'
                    : m === 'countdown'
                    ? 'timer-sand'
                    : 'sync'
                }
                size={22}
                color={mode === m ? theme.primary : theme.textDim}
              />
              <Text
                style={[
                  styles.modeLabel,
                  mode === m && { color: theme.primary },
                ]}
              >
                {m === 'stopwatch'
                  ? 'Stopwatch'
                  : m === 'countdown'
                  ? 'Countdown'
                  : 'Intervals'}
              </Text>
            </Pressable>
          ))}
        </View>

        {mode === 'countdown' && (
          <View style={styles.cfgRow}>
            <Text style={styles.cfgLabel}>Seconds</Text>
            <TextInput
              value={String(target)}
              onChangeText={(v) => setTarget(parseInt(v || '0', 10))}
              keyboardType="numeric"
              style={styles.cfgInput}
            />
          </View>
        )}
        {mode === 'intervals' && (
          <>
            <View style={styles.cfgRow}>
              <Text style={styles.cfgLabel}>Work (s)</Text>
              <TextInput
                value={String(workSec)}
                onChangeText={(v) => setWorkSec(parseInt(v || '0', 10))}
                keyboardType="numeric"
                style={styles.cfgInput}
              />
            </View>
            <View style={styles.cfgRow}>
              <Text style={styles.cfgLabel}>Rest (s)</Text>
              <TextInput
                value={String(restSec)}
                onChangeText={(v) => setRestSec(parseInt(v || '0', 10))}
                keyboardType="numeric"
                style={styles.cfgInput}
              />
            </View>
          </>
        )}

        <View style={styles.recentBox}>
          <Text style={styles.recentText}>No recent records</Text>
          <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10 }} />
          <Text style={styles.recentText}>No activity selected</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', paddingHorizontal: 16 },
  ring: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
    borderColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  time: { color: theme.text, fontSize: 48, fontWeight: '700' },
  phase: { color: theme.primary, fontSize: 14, marginTop: 6, letterSpacing: 2 },
  controls: { flexDirection: 'row', marginTop: 28, gap: 12, alignItems: 'center' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 8,
  },
  startText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
  resetBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    marginTop: 28,
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 4,
  },
  modeBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  modeActive: {
    backgroundColor: theme.primarySoft,
  },
  modeLabel: { color: theme.textDim, fontSize: 12, marginTop: 2 },
  cfgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    width: '85%',
    justifyContent: 'space-between',
  },
  cfgLabel: { color: theme.textDim },
  cfgInput: {
    color: theme.text,
    minWidth: 80,
    textAlign: 'right',
    fontSize: 16,
  },
  recentBox: {
    marginTop: 20,
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 12,
  },
  recentText: { color: theme.textDim, textAlign: 'center' },
});
