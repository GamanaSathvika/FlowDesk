import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './MainScreen.styles';

export default function HomeLandingScreen() {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.card}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Your calm, focused workspace starts here.</Text>
        <Text style={styles.hint}>This is the Landing screen (bottom nav active: Home).</Text>
      </View>
    </View>
  );
}

