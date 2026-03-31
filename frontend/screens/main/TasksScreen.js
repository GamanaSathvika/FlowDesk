import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './MainScreen.styles';

export default function TasksScreen() {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.card}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>Capture what matters, then move with clarity.</Text>
        <Text style={styles.hint}>Coming soon: task lists, priorities, and quick actions.</Text>
      </View>
    </View>
  );
}

