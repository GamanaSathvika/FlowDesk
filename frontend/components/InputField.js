// InputField.js — Fixed + Enhanced for proper keyboard handling
import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InputField = forwardRef((props, ref) => {
  const {
    icon,
    label,
    placeholder,
    value,
    onChangeText,
    secure = false,
    keyboardType = 'default',
    textContentType,
    autoComplete,
    returnKeyType = 'next',
    blurOnSubmit = false,
    autoCapitalize = 'none',
    onSubmitEditing,
    ...rest
  } = props;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputWrapper}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color="#64748B"
            style={styles.icon}
          />
        )}

        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          secureTextEntry={secure}
          keyboardType={keyboardType}
          textContentType={textContentType}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          {...rest}
        />
      </View>
    </View>
  );
});

export default InputField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2538',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A374F',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#E8EDF7',
    fontSize: 16,
    paddingVertical: 12,
  },
});