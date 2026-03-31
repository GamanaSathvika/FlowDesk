import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './MainScreen.styles';

export default function FocusScreen() {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.card}>
        <Text style={styles.title}>Focus</Text>
        <Text style={styles.subtitle}>Start a session and protect your attention.</Text>
        <Text style={styles.hint}>Coming soon: timers, sessions, and focus modes.</Text>
      </View>
    </View>
  );
}

