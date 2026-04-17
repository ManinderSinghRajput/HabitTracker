export type IconName = string;

export type Category = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  isDefault?: boolean;
};

export type HabitType = 'habit' | 'quit' | 'task';

export type Frequency =
  | { kind: 'daily' }
  | { kind: 'weekly'; days: number[] } // 0-6 Sun..Sat
  | { kind: 'monthly'; dates: number[] }
  | { kind: 'interval'; everyNDays: number };

export type EntryStatus = 'pending' | 'done' | 'fail' | 'skip';

export type HabitEntry = {
  date: string; // YYYY-MM-DD
  status: EntryStatus;
  note?: string;
  valueDone?: number; // for countable habits
};

export type Habit = {
  id: string;
  name: string;
  description?: string;
  type: HabitType;
  categoryId: string;
  icon: IconName;
  color: string;
  frequency: Frequency;
  targetPerDay?: number; // count target
  unit?: string; // e.g. "reps", "glasses"
  priority?: number; // 1..5
  reminderTimes?: string[]; // "HH:mm"
  startDate: string; // YYYY-MM-DD
  archived?: boolean;
  createdAt: number;
  entries: Record<string, HabitEntry>; // date => entry
};

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  recurring?: Frequency; // if set => recurring task
  priority?: number;
  categoryId?: string;
  completed: boolean;
  completedDates?: string[];
  createdAt: number;
};

export type Expense = {
  id: string;
  amount: number;
  note?: string;
  categoryId?: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  color?: string;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type AppState = {
  categories: Category[];
  habits: Habit[];
  tasks: Task[];
  expenses: Expense[];
  notes: Note[];
  settings: {
    currency: string;
    firstDayOfWeek: 0 | 1; // 0 Sun, 1 Mon
    accentColor: string;
  };
};
