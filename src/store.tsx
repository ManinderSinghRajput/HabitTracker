import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Category, Expense, Habit, HabitEntry, Note, Task } from './types';
import { uid } from './utils/id';
import { fmtDate, parseDate } from './utils/date';

// Current key. Old HabitNow key is migrated on first launch.
const STORAGE_KEY = '@ritual/state/v1';
const LEGACY_STORAGE_KEY = '@habitnow/state/v1';

const defaultCategories: Category[] = [
  { id: 'cat-meals', name: 'Meals', icon: 'silverware-fork-knife', color: '#8BC53F' },
  { id: 'cat-habit', name: 'Habit', icon: 'trending-up', color: '#F19934' },
  { id: 'cat-quit', name: 'Quit a bad habit', icon: 'close-octagon-outline', color: '#E45D3E', isDefault: true },
  { id: 'cat-task', name: 'Task', icon: 'clock-outline', color: '#E6305E', isDefault: true },
  { id: 'cat-other', name: 'Other', icon: 'shape-outline', color: '#E45D3E', isDefault: true },
  { id: 'cat-expense', name: 'Expenses', icon: 'cash', color: '#E45D3E' },
  { id: 'cat-notes', name: 'Notes', icon: 'note-text-outline', color: '#A06AE3' },
];

const seedHabit = (partial: Partial<Habit>): Habit => ({
  id: uid(),
  name: 'New Habit',
  type: 'habit',
  categoryId: 'cat-habit',
  icon: 'star',
  color: '#F19934',
  frequency: { kind: 'daily' },
  startDate: fmtDate(new Date()),
  createdAt: Date.now(),
  entries: {},
  ...partial,
});

const initialState: AppState = {
  categories: defaultCategories,
  habits: [
    seedHabit({
      name: 'Expence',
      icon: 'shape-outline',
      color: '#E45D3E',
      categoryId: 'cat-habit',
      description: 'Log daily expenses',
    }),
    seedHabit({
      name: 'Breakfast',
      icon: 'silverware-fork-knife',
      color: '#8BC53F',
      categoryId: 'cat-meals',
      reminderTimes: ['08:00'],
    }),
    seedHabit({
      name: 'Lunch',
      icon: 'silverware-fork-knife',
      color: '#8BC53F',
      categoryId: 'cat-meals',
      reminderTimes: ['13:00'],
    }),
    seedHabit({
      name: 'Dinner',
      icon: 'silverware-fork-knife',
      color: '#8BC53F',
      categoryId: 'cat-meals',
      reminderTimes: ['20:00'],
    }),
    seedHabit({ name: 'Gym', icon: 'dumbbell', color: '#F19934', categoryId: 'cat-habit' }),
    seedHabit({ name: 'Hair oil', icon: 'water-outline', color: '#F19934', categoryId: 'cat-habit' }),
  ],
  tasks: [],
  expenses: [],
  notes: [],
  settings: {
    currency: '$',
    firstDayOfWeek: 1,
    accentColor: '#E6305E',
  },
};

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'addHabit'; habit: Habit }
  | { type: 'updateHabit'; habit: Habit }
  | { type: 'deleteHabit'; id: string }
  | { type: 'setEntry'; habitId: string; entry: HabitEntry }
  | { type: 'addTask'; task: Task }
  | { type: 'updateTask'; task: Task }
  | { type: 'deleteTask'; id: string }
  | { type: 'toggleTask'; id: string; date?: string }
  | { type: 'addCategory'; category: Category }
  | { type: 'updateCategory'; category: Category }
  | { type: 'deleteCategory'; id: string }
  | { type: 'addExpense'; expense: Expense }
  | { type: 'updateExpense'; expense: Expense }
  | { type: 'deleteExpense'; id: string }
  | { type: 'addNote'; note: Note }
  | { type: 'updateNote'; note: Note }
  | { type: 'deleteNote'; id: string }
  | { type: 'updateSettings'; patch: Partial<AppState['settings']> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'addHabit':
      return { ...state, habits: [action.habit, ...state.habits] };
    case 'updateHabit':
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.habit.id ? action.habit : h)),
      };
    case 'deleteHabit':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) };
    case 'setEntry':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.habitId
            ? { ...h, entries: { ...h.entries, [action.entry.date]: action.entry } }
            : h
        ),
      };
    case 'addTask':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'updateTask':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)),
      };
    case 'deleteTask':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case 'toggleTask': {
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.id) return t;
          if (t.recurring && action.date) {
            const done = t.completedDates ?? [];
            const has = done.includes(action.date);
            return {
              ...t,
              completedDates: has
                ? done.filter((d) => d !== action.date)
                : [...done, action.date],
            };
          }
          return { ...t, completed: !t.completed };
        }),
      };
    }
    case 'addCategory':
      return { ...state, categories: [...state.categories, action.category] };
    case 'updateCategory':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.category.id ? action.category : c
        ),
      };
    case 'deleteCategory':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
      };
    case 'addExpense':
      return { ...state, expenses: [action.expense, ...state.expenses] };
    case 'updateExpense':
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.expense.id ? action.expense : e)),
      };
    case 'deleteExpense':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
    case 'addNote':
      return { ...state, notes: [action.note, ...state.notes] };
    case 'updateNote':
      return {
        ...state,
        notes: state.notes.map((n) => (n.id === action.note.id ? action.note : n)),
      };
    case 'deleteNote':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    default:
      return state;
  }
}

type Ctx = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const StoreContext = createContext<Ctx | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        let raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          // One-time migration from HabitNow -> Ritual
          const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacy) {
            await AsyncStorage.setItem(STORAGE_KEY, legacy);
            await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
            raw = legacy;
          }
        }
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          dispatch({ type: 'hydrate', state: parsed });
        }
      } catch {
        // corrupt or unreadable — fall back to initialState
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
};

// Helpers
export function habitActiveOnDate(habit: Habit, date: Date) {
  const ds = fmtDate(date);
  const freq = habit.frequency;
  if (freq.kind === 'daily') return true;
  if (freq.kind === 'weekly') return ds >= habit.startDate ? freq.days.includes(date.getDay()) : true;
  if (freq.kind === 'monthly') return ds >= habit.startDate ? freq.dates.includes(date.getDate()) : true;
  if (freq.kind === 'interval') {
    const start = parseDate(habit.startDate);
    const diff = Math.floor((+date - +start) / 86400000);
    return diff >= 0 && diff % freq.everyNDays === 0;
  }
  return false;
}

// Same shape as habitActiveOnDate but for Task.recurring frequency.
// Returns true on days the task is scheduled, false otherwise.
export function taskActiveOnDate(task: Task, date: Date, startKey: string): boolean {
  if (!task.recurring) return fmtDate(date) === task.dueDate;
  const ds = fmtDate(date);
  if (ds < startKey) return false;
  const freq = task.recurring;
  if (freq.kind === 'daily') return true;
  if (freq.kind === 'weekly') return freq.days.includes(date.getDay());
  if (freq.kind === 'monthly') return freq.dates.includes(date.getDate());
  if (freq.kind === 'interval') {
    const start = parseDate(startKey);
    const diff = Math.floor((+date - +start) / 86400000);
    return diff >= 0 && diff % freq.everyNDays === 0;
  }
  return false;
}

export function habitEntry(habit: Habit, date: Date): HabitEntry {
  const ds = fmtDate(date);
  return habit.entries[ds] ?? { date: ds, status: 'pending' };
}

export function computeStats(habit: Habit) {
  const entries = Object.values(habit.entries);
  let done = 0, fail = 0, pending = 0, skip = 0;
  for (const e of entries) {
    if (e.status === 'done') done++;
    else if (e.status === 'fail') fail++;
    else if (e.status === 'skip') skip++;
    else pending++;
  }
  let streak = 0;
  let best = 0;
  const sorted = entries.slice().sort((a, b) => a.date.localeCompare(b.date));
  let run = 0;
  for (const e of sorted) {
    if (e.status === 'done') {
      run++;
      best = Math.max(best, run);
    } else if (e.status === 'skip') {
      // skip doesn't break streak
    } else {
      run = 0;
    }
  }
  const today = new Date();
  let d = new Date(today);
  while (true) {
    const key = fmtDate(d);
    const e = habit.entries[key];
    if (!e) break;
    if (e.status === 'done') streak++;
    else if (e.status === 'skip') { /* skip */ }
    else break;
    d = new Date(d);
    d.setDate(d.getDate() - 1);
  }
  const total = done + fail + pending;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, fail, pending, skip, streak, best, percent };
}
