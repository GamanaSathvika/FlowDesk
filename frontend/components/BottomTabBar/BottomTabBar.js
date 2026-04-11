// components/BottomTabBar/BottomTabBar.js
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
  {
    key: 'home',
    label: 'Home',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    key: 'tasks',
    label: 'Tasks',
    icon: 'checkmark-circle-outline',
    iconActive: 'checkmark-circle',
  },
  {
    key: 'focus',
    label: 'Focus',
    icon: 'timer-outline',
    iconActive: 'timer',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: 'bar-chart-outline',
    iconActive: 'bar-chart',
  },
];

const BLUE   = '#3B82F6';
const GRAY   = '#9CA3AF';
const ACTIVE_BG = 'rgba(59,130,246,0.09)';

// ─── Single Tab ───────────────────────────────────────────────────────────────
function TabItem({ tab, isActive, onPress }) {
  const handlePress = useCallback(() => onPress(tab.key), [onPress, tab.key]);

  return (
    <Pressable
      onPress={handlePress}
      style={s.tabItem}
      hitSlop={6}
      android_ripple={{ color: 'rgba(59,130,246,0.08)', borderless: true, radius: 36 }}
    >
      {/* Active pill background */}
      <View style={[s.iconWrap, isActive && s.iconWrapActive]}>
        <Ionicons
          name={isActive ? tab.iconActive : tab.icon}
          size={23}
          color={isActive ? BLUE : GRAY}
        />
      </View>

      <Text style={[s.label, isActive && s.labelActive]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
export default function BottomTabBar({ activeTab, onTabPress }) {
  return (
    <View style={s.container}>
      {/* Thin top border */}
      <View style={s.topBorder} />

      <View style={s.row}>
        {TABS.map((tab) => (
          <TabItem
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={onTabPress}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    // Soft shadow upward
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
    // Enough bottom padding for home indicator on iOS
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },

  topBorder: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 8,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 3,
  },

  // Subtle pill behind icon when active
  iconWrap: {
    width: 44,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: ACTIVE_BG,
  },

  label: {
    fontSize: 11,
    fontWeight: '500',
    color: GRAY,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: BLUE,
    fontWeight: '700',
  },
});