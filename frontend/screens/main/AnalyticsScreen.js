import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './MainScreen.styles';

export default function AnalyticsScreen() {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.card}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Understand your productivity trends.</Text>
        <Text style={styles.hint}>Coming soon: weekly insights and focus stats.</Text>
      </View>
    </View>
  );
}

