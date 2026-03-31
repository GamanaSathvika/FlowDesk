import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InputField({
  icon,
  placeholder,
  secure,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  textContentType,
  autoComplete,
}) {
  const [hidePassword, setHidePassword] = useState(secure);
  const [isFocused, setIsFocused] = useState(false);
  const showSecureToggle = Boolean(secure);

  const containerStyle = useMemo(
    () => [
      styles.container,
      isFocused ? styles.containerFocused : styles.containerIdle,
    ],
    [isFocused]
  );

  return (
    <View style={containerStyle}>
      <Ionicons name={icon} size={18} color={isFocused ? "#3B82F6" : "#6B7280"} />

      <TextInput
        placeholder={placeholder}
        style={styles.input}
        secureTextEntry={hidePassword}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        textContentType={textContentType}
        autoComplete={autoComplete}
      />

      {showSecureToggle && (
        <Pressable onPress={() => setHidePassword(!hidePassword)} hitSlop={10}>
          <Ionicons
            name={hidePassword ? "eye-off" : "eye"}
            size={18}
            color="#6B7280"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  containerIdle: {
    borderColor: "#E5E7EB",
  },
  containerFocused: {
    borderColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 0,
  },
});