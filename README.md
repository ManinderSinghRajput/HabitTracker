# Ritual — Habits, Tasks, Expenses & Notes

> _Small rituals. Big days._

A cross-platform (iOS + Android) tracker app built with **Expo + React Native + TypeScript**. Formerly **HabitNow**; data from the old key is migrated automatically on first launch.

Everything is stored **locally on device** via `AsyncStorage` — no account or internet required.

---

## Features

- **Today** — date strip, category filter, quick check-off, per-entry action sheet (Pending / Done / Fail / Skip, note, reset)
- **Habits** — progress cards with current streak & completion %
- **Tasks** — single + recurring tabs with animated indicator; per-task history calendar with pending/done/missed/skipped states
- **Categories** — custom & default categories with icons/colors
- **Timer** — Stopwatch, Countdown, Intervals (work/rest loop)
- **Habit detail** — Calendar heatmap, Statistics (monthly bars, Success/Fail donut, streak cards, times-completed table)
- **Expenses** — add/edit expenses with categories, monthly total
- **Notes** — colored note grid with pin + long-press to delete
- **Settings** — currency, first day of week, accent color palette
- **Drawer menu** — News, Categories, Timer, Customize, Settings, Account, Premium, Rate, Contact
- Dark theme with named typography scale and three surface tiers; card-wrapped rows; colored accent shadow on the FAB; haptics-ready toggles

---

## Project layout

```
App.tsx                 # root providers
index.ts                # expo entry
app.json                # Ritual name/slug/scheme/bundleId
src/
  navigation.tsx        # stack + tabs + drawer
  store.tsx             # reducer + AsyncStorage (with HabitNow→Ritual migration)
  types.ts              # Habit / Task / Expense / Note / Category types
  theme.ts              # palette, radius, named `type` scale
  utils/date.ts         # date helpers
  utils/id.ts           # id generator
  utils/icons.ts        # icon name resolver
  components/           # DateStrip, CategoryChips, HabitRow, IconBadge,
                        # FAB, ScreenHeader, EntryActionSheet, HistoryCalendar
  screens/              # Today, Habits, Tasks, Categories, Timer,
                        # AddHabit, AddTask, HabitDetail, Expenses,
                        # AddExpense, Notes, AddNote, Settings,
                        # DrawerContent, NewCategory
```

---

## 1. Prereqs

Minimum:
- **Node.js 18+**
- **npm** (comes with Node)

For simulator / emulator testing:
- **iOS**: Xcode (macOS only). Install from the App Store.
- **Android**: Android Studio — https://developer.android.com/studio

For local Android APK builds:
- **JDK 17** (Temurin or Android Studio's bundled JBR)
- **Homebrew** (easiest way to install JDK on macOS) — https://brew.sh

---

## 2. Install

```sh
cd HabitTracker
npm install
```

---

## 3. Run the dev server

```sh
npx expo start
```

Opens Metro with a QR code.

### On a physical phone (Expo Go — easiest)

**iPhone:**
1. Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779).
2. Open the iPhone Camera app, point at the terminal QR code → tap the notification.
3. Phone must be on the same Wi-Fi as your Mac. Otherwise: `npx expo start --tunnel`.

**Android:**
1. Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Open Expo Go → "Scan QR code".
3. Same-Wi-Fi or `--tunnel` as above.

### On simulators / emulators

```sh
npx expo start --ios       # iOS Simulator (macOS + Xcode required)
npx expo start --android   # Android Emulator (must already be running)
```

---

## 4. Testing on Android over macOS

### Option A — Expo Go on a physical Android phone (~2 min)

Already covered above. Fastest path; all our runtime deps are Expo Go–compatible.

### Option B — Android Emulator on the Mac

**One-time setup:**

1. Install **Android Studio**.
2. First-run wizard → accept the default SDK install.
3. **More Actions → SDK Manager** → install "Android SDK Platform 34" + "Android SDK Build-Tools".
4. **More Actions → Virtual Device Manager → Create device** → Pixel 7 (or Pixel 4a for small, Pixel 8 Pro for large) → pick a system image at API 34 → Finish.
5. Add to `~/.zshrc`:
   ```sh
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
   ```
   Then `source ~/.zshrc`.

**Verify:**
```sh
adb devices      # should list the running emulator
```

**Run:**
```sh
# Start the emulator first (from Virtual Device Manager), then:
npx expo start --android
```

### Device matrix worth covering

| iOS | Android |
|---|---|
| iPhone SE (small) | Pixel 4a (small) |
| iPhone 15 (standard) | Pixel 7 (standard) |
| iPhone 15 Pro Max (dynamic island) | Pixel 8 Pro (large) |

Platform-specific things to exercise:
- **Elevation shadow** on FAB (Android uses `elevation`, iOS uses `shadowColor`)
- **Hardware back button** (Android only) — drawer open → back should close drawer
- **Ripple on Pressables** (Android) — shouldn't bleed past card corners
- **Status bar** — dark bg should have light-content status bar

---

## 5. Build an APK

Two paths. Pick based on intent.

### Path 1 — EAS Build (cloud, recommended)

No local Android toolchain required. Build runs on Expo's servers.

**One-time:**
```sh
npm install -g eas-cli
eas login
eas init               # links the project to an EAS project id
```

**Configure APK output** — create `eas.json` at the project root:
```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

**Build:**
```sh
eas build --platform android --profile preview
```

- First build prompts to generate an Android keystore — say **yes**, EAS manages it.
- ~10–20 min on the free tier queue.
- Download URL printed when done, or:
  ```sh
  eas build:run --platform android --latest
  ```

For Play Store submission later:
```sh
eas build --platform android --profile production   # builds AAB
```

### Path 2 — Local Gradle build

Fastest iteration once set up, but requires full toolchain.

**Install JDK 17 (macOS):**
```sh
# If Homebrew is missing:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install --cask temurin@17
```

Add to `~/.zshrc`:
```sh
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH
```
Then `source ~/.zshrc` and verify with `java -version` (should print "openjdk version 17...").

Alternative (no separate JDK install, if you already have Android Studio):
```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH=$JAVA_HOME/bin:$PATH
```

**Generate the native `android/` project:**
```sh
npx expo prebuild --platform android
```

**Quick unsigned debug APK** (installable, not shippable):
```sh
cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

**Signed release APK:**
```sh
cd android/app
keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore -alias ritual \
  -keyalg RSA -keysize 2048 -validity 10000
```

Add to `android/gradle.properties`:
```
MYAPP_UPLOAD_STORE_FILE=release.keystore
MYAPP_UPLOAD_KEY_ALIAS=ritual
MYAPP_UPLOAD_STORE_PASSWORD=...
MYAPP_UPLOAD_KEY_PASSWORD=...
```

Wire it into `android/app/build.gradle` `signingConfigs.release` (the prebuild template has comments showing where). Then:
```sh
cd android
./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

### Installing the APK on a device

```sh
adb install path/to/app.apk
```
Or copy the APK to the phone and open it (enable "Install from unknown sources" if prompted).

---

## 6. Static checks

Before booting a simulator:

```sh
npx tsc --noEmit          # type check
npx expo-doctor           # dep + config health check
npx expo install --check  # verifies dep compat with Expo SDK
```

---

## 7. Data & migration

- Current AsyncStorage key: `@ritual/state/v1`
- Legacy key (auto-migrated on first launch if present): `@habitnow/state/v1`
- Migration logic lives in `src/store.tsx` — reads legacy, writes new, removes legacy. No user action required.
- Uninstalling the app clears all data.

---

## 8. Recent architectural notes

### Pinned-header layout (TodayScreen, HabitsScreen, TasksScreen)

Screens lay out as:
```
SafeAreaView { flex: 1 }
├── View (intrinsic height)        ← header + date strip + chips / tabs
└── View { flex: 1 }               ← single flex child, contains the list
```

This prevents the chip-drift bug: when the list shrinks, free space has nowhere to redistribute.

### CategoryChips

- No `alignItems: 'center'` on the contentContainer (that was the cross-axis centering that caused drift).
- Explicit `height: 44` on the ScrollView, `height: 40` on each chip.
- Active state uses a single subtle `accent + '33'` fill + border.

### Task history calendar

- `HistoryStatus` includes `'pending'` — today's incomplete task renders as an outlined primary-colored circle, not red.
- Recurring tasks consult `taskActiveOnDate(task, date, startKey)` (see `src/store.tsx`) which respects `frequency.kind`. Off-schedule days render as `'off'`.
- `monthDate` is lifted to the parent (TasksScreen), so reopening the calendar for the same task preserves the month you were viewing.
- Optimistic completion update removed — `historyTask` is re-derived from `state.tasks` via `useMemo`.

### Theme

- Three surface tiers: `bg` → `surface` → `surfaceElevated`.
- Softer `border: #1E1E22` (only ~2 units above surface) for "feel but not see" dividers.
- Named typography scale: `display / title / body / label / caption`.

---

## Tech stack

- expo ^54.0.0
- react-native 0.81
- react 19.1
- react-navigation 6 (stack + bottom tabs + drawer)
- @react-native-async-storage/async-storage 2.2
- react-native-reanimated 4.1 + react-native-worklets
- react-native-svg 15 (charts)
- @expo/vector-icons (MaterialCommunityIcons)
- expo-haptics, expo-linear-gradient

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Unable to locate a Java Runtime` | Install JDK 17 and set `JAVA_HOME` (see Path 2 above) |
| `Missing peer dependency: react-native-worklets` | `npx expo install react-native-worklets` |
| Chips drift vertically when switching category | Should be fixed; confirm screen wraps list in `<View style={{flex:1}}>` |
| Calendar marks today in red before day ends | Should return `'pending'` from `getTaskStatus` in TasksScreen |
| Weekly recurring task shows red on every weekday | `taskActiveOnDate` must be consulted; check `src/store.tsx` |
| QR code doesn't connect | `npx expo start --tunnel` |
| `adb: command not found` | Add `$ANDROID_HOME/platform-tools` to PATH |
