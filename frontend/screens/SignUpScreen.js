import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";

import InputField from "../components/InputField";
import AuthHeader from "../components/AuthHeader";
import GradientButton from "../components/GradientButton";
import PressableScale from "../components/PressableScale";
import { styles } from "./SignUpScreen.styles";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSignup = () => {
    if (!name || !email || !password || !confirm) {
      setError("Please complete all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#F6F8FC", "#EEF3FF", "#E8F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.container}
      >
        <View style={[styles.shape, styles.shapeA]} />
        <View style={[styles.shape, styles.shapeB]} />
        <View style={[styles.shape, styles.shapeC]} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              entering={FadeInDown.duration(520)}
              exiting={FadeOut.duration(180)}
              style={styles.card}
            >
              <AuthHeader subtitle="Create your account" />

              <View style={styles.form}>
                <InputField
                  icon="person-outline"
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  textContentType="name"
                  autoComplete="name"
                />

                <InputField
                  icon="mail-outline"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  textContentType="username"
                  autoComplete="email"
                />

                <InputField
                  icon="lock-closed-outline"
                  placeholder="Password"
                  secure
                  value={password}
                  onChangeText={setPassword}
                  textContentType="newPassword"
                  autoComplete="new-password"
                />

                <InputField
                  icon="shield-checkmark-outline"
                  placeholder="Confirm Password"
                  secure
                  value={confirm}
                  onChangeText={setConfirm}
                  textContentType="newPassword"
                  autoComplete="new-password"
                />

                <GradientButton
                  label="Create Account"
                  onPress={handleSignup}
                  style={styles.primaryBtn}
                />
              </View>

              {Boolean(error) && <Text style={styles.error}>{error}</Text>}

              <PressableScale
                pressedScale={0.99}
                style={styles.footerWrap}
                onPress={() => {
                  setTimeout(() => {
                    navigation.navigate("Login");
                  }, 130);
                }}
              >
                <Text style={styles.footer}>
                  Already have an account? <Text style={styles.link}>Login</Text>
                </Text>
              </PressableScale>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}