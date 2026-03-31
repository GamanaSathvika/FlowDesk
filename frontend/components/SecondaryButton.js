import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PressableScale from './PressableScale';

export default function SecondaryButton({ label, onPress, iconName = 'chrome', style }) {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, style]}
      pressedScale={0.985}
    >
      <View style={styles.row}>
        <Feather name={iconName} size={16} color="#374151" />
        <Text style={styles.text}>{label}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

