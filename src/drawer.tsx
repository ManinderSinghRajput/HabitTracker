import React from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { DrawerContent } from './screens/DrawerContent';

type DrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  available: boolean;
};

const noop = () => {};

const fallbackValue: DrawerContextValue = {
  openDrawer: noop,
  closeDrawer: noop,
  toggleDrawer: noop,
  available: false,
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

export const useAppDrawer = () => {
  return React.useContext(DrawerContext) ?? fallbackValue;
};

export const AppDrawerLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const progress = React.useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = React.useState(false);

  const animateTo = React.useCallback(
    (toValue: 0 | 1, onDone?: () => void) => {
      Animated.timing(progress, {
        toValue,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onDone?.();
      });
    },
    [progress]
  );

  const openDrawer = React.useCallback(() => {
    setVisible(true);
    progress.stopAnimation();
    animateTo(1);
  }, [animateTo, progress]);

  const closeDrawer = React.useCallback(() => {
    progress.stopAnimation();
    animateTo(0, () => setVisible(false));
  }, [animateTo, progress]);

  const toggleDrawer = React.useCallback(() => {
    if (visible) closeDrawer();
    else openDrawer();
  }, [closeDrawer, openDrawer, visible]);

  const value = React.useMemo(
    () => ({ openDrawer, closeDrawer, toggleDrawer, available: true }),
    [openDrawer, closeDrawer, toggleDrawer]
  );

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-320, 0],
  });

  return (
    <DrawerContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {visible ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
              pointerEvents="none"
              style={[
                styles.backdrop,
                {
                  opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            />
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
            <Animated.View
              style={[styles.drawer, { transform: [{ translateX }] }]}
            >
              <DrawerContent onNavigate={closeDrawer} />
            </Animated.View>
          </View>
        ) : null}
      </View>
    </DrawerContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    backgroundColor: '#0E0E10',
  },
});
