import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import PressableScale from '../PressableScale';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { styles } from './BottomTabBar.styles';

function TabButton({ active, emoji, label, onPress }) {
  const scale = useSharedValue(active ? 1.08 : 1);

  useEffect(() => {
    scale.value = withSpring(active ? 1.08 : 1, { damping: 16, stiffness: 160 });
  }, [active, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <PressableScale onPress={onPress} pressedScale={0.99} style={[styles.tab, active && null]} hitSlop={8}>
      <Animated.View style={animatedStyle}>
        <View style={[styles.indicator, active && styles.indicatorActive]} />
        <Text style={[styles.icon, active && styles.iconActive]}>{emoji}</Text>
        <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      </Animated.View>
    </PressableScale>
  );
}

export default function BottomTabBar({ activeTab, onTabPress }) {
  const tabs = [
    { key: 'home', emoji: '🏠', label: 'Home' },
    { key: 'tasks', emoji: '✅', label: 'Tasks' },
    { key: 'focus', emoji: '⏱️', label: 'Focus' },
    { key: 'analytics', emoji: '📊', label: 'Analytics' },
  ];

  return (
    <View style={styles.safeBar}>
      <View style={styles.barShell}>
        <View style={styles.row}>
          {tabs.map((t) => (
            <TabButton
              key={t.key}
              active={activeTab === t.key}
              emoji={t.emoji}
              label={t.label}
              onPress={() => onTabPress(t.key)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

