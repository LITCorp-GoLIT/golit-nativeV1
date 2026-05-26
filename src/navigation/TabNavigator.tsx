/**
 * TabNavigator — matches web BottomNavigation.tsx exactly.
 * LEFT pill: Home (always) + Social/Saved/Profile (collapse on scroll)
 * RIGHT pill: Search (always, circle)
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { HomeScreen }    from '../screens/HomeScreen';
import { SocialScreen }  from '../screens/SocialScreen';
import { SavedScreen }   from '../screens/SavedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen }  from '../screens/SearchScreen';
import { TabParamList } from '../types';
import { useNavCollapse } from '../contexts/NavCollapseContext';

const Tab = createBottomTabNavigator<TabParamList>();

// Exact web values
const PILL_HEIGHT = 60;
const PILL_RADIUS = 30;
const ICON_SIZE = 22;
// cubic-bezier(0.22, 1, 0.36, 1) ≈ Easing.out(Easing.exp)
const ANIM_DURATION = 420;
const EASING = Easing.out(Easing.exp);

// Mirrors web: Home (left primary) + [Social, Saved, Profile] (secondary) + Search (right)
const PRIMARY: { name: keyof TabParamList; icon: string } = {
  name: 'Discover',
  icon: 'home',
};
// Exact order from web secondary array: social(Users), saved(Bookmark), profile(User)
const SECONDARY: Array<{ name: keyof TabParamList; icon: string }> = [
  { name: 'Social',  icon: 'users'    },
  { name: 'Saved',   icon: 'bookmark' },
  { name: 'Profile', icon: 'user'     },
];
// Right pill = Search (mirrors web's Search pill)
const RIGHT: { name: keyof TabParamList; icon: string } = {
  name: 'Search',
  icon: 'search',
};

const GLASS_BORDER = {
  borderWidth: 0.5,
  borderColor: 'rgba(255,255,255,0.08)' as const,
};
const GLASS_SHADOW = {
  shadowColor: '#000' as const,
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.6,
  shadowRadius: 20,
};

// Active dot: #E8621A with glow — exact web value
const NavDot: React.FC<{ active: boolean }> = ({ active }) => (
  <View
    style={[
      styles.dot,
      active
        ? { opacity: 1, shadowOpacity: 0.85 }
        : { opacity: 0, shadowOpacity: 0 },
    ]}
  />
);

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const { isCollapsed } = useNavCollapse();

  // Animated width of left pill — 1 = expanded, 0 = collapsed (60px circle)
  const leftPillAnim   = useRef(new Animated.Value(1)).current;
  const secOpacity     = useRef(new Animated.Value(1)).current;
  const secTranslateX  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(leftPillAnim, {
      toValue: isCollapsed ? 0 : 1,
      duration: ANIM_DURATION,
      easing: EASING,
      useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(secOpacity, {
        toValue: isCollapsed ? 0 : 1,
        duration: isCollapsed ? 180 : 260,
        delay: isCollapsed ? 0 : 120,
        easing: EASING,
        useNativeDriver: true,
      }),
      Animated.timing(secTranslateX, {
        toValue: isCollapsed ? -28 : 0,
        duration: ANIM_DURATION,
        easing: EASING,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCollapsed]);

  const isActive = (name: string) => state.routes[state.index].name === name;

  const navigate = (name: string, currentlyFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!currentlyFocused) navigation.navigate(name);
  };

  const renderIcon = (tab: { name: keyof TabParamList; icon: string }) => {
    const active = isActive(tab.name);
    return (
      <TouchableOpacity
        key={tab.name}
        onPress={() => navigate(tab.name, active)}
        style={styles.iconBtn}
        activeOpacity={0.7}
      >
        <Feather
          name={tab.icon as any}
          size={ICON_SIZE}
          // Web: strokeWidth 2.2 active / 1.7 inactive (Feather doesn't expose
          // strokeWidth, so we use color exactly as the web does)
          color={active ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
        />
        <NavDot active={active} />
      </TouchableOpacity>
    );
  };

  const leftWidth = leftPillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PILL_HEIGHT, 9999],
    extrapolate: 'clamp',
  });

  const renderPill = (children: React.ReactNode, style: object) =>
    Platform.OS === 'ios' ? (
      <BlurView intensity={80} tint="dark" style={[style, GLASS_BORDER]}>
        {children}
      </BlurView>
    ) : (
      <View style={[style, GLASS_BORDER, { backgroundColor: 'rgba(14,14,16,0.92)' }]}>
        {children}
      </View>
    );

  const bottomPad = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]} pointerEvents="box-none">
      {/* LEFT PILL */}
      <Animated.View
        style={[
          styles.leftPillWrapper,
          GLASS_SHADOW,
          { maxWidth: leftWidth, overflow: 'hidden' },
        ]}
      >
        {renderPill(
          <View style={styles.pillInner}>
            {/* Home — always visible */}
            <View style={styles.primaryIcon}>
              {renderIcon(PRIMARY)}
            </View>
            {/* Social + Saved + Profile — collapse on scroll */}
            <Animated.View
              style={[
                styles.secondaryIcons,
                {
                  opacity: secOpacity,
                  transform: [{ translateX: secTranslateX }],
                  pointerEvents: isCollapsed ? 'none' : 'auto',
                },
              ]}
            >
              {SECONDARY.map(renderIcon)}
            </Animated.View>
          </View>,
          styles.leftPill,
        )}
      </Animated.View>

      {/* RIGHT PILL — Search circle */}
      {renderPill(
        <View style={styles.pillInner}>{renderIcon(RIGHT)}</View>,
        [styles.rightPill, GLASS_SHADOW],
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  leftPillWrapper: {
    flex: 1,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
  },
  leftPill: {
    flex: 1,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
  },
  rightPill: {
    width: PILL_HEIGHT,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
    flexShrink: 0,
  },
  pillInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryIcon: {
    flexShrink: 0,
    paddingLeft: 6,
  },
  secondaryIcons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingRight: 12,
    minWidth: 0,
  },
  iconBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8621A',
    marginTop: 3,
    shadowColor: '#E8621A',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 0,
  },
});

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Discover" component={HomeScreen} />
    <Tab.Screen name="Social"   component={SocialScreen} />
    <Tab.Screen name="Saved"    component={SavedScreen} />
    <Tab.Screen name="Profile"  component={ProfileScreen} />
    <Tab.Screen name="Search"   component={SearchScreen} />
  </Tab.Navigator>
);
