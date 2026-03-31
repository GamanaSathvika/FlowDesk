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
import SecondaryButton from "../components/SecondaryButton";
import DividerOr from "../components/DividerOr";
import PressableScale from "../components/PressableScale";
import { styles } from "./LoginScreen.styles";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
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
              <AuthHeader subtitle="Welcome back 👋" />

              <View style={styles.form}>
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
                  textContentType="password"
                  autoComplete="password"
                />

                <PressableScale pressedScale={0.99} style={styles.forgotWrap}>
                  <Text style={styles.forgot}>Forgot Password?</Text>
                </PressableScale>

                <GradientButton label="Login" onPress={handleLogin} />

                <DividerOr />

                <SecondaryButton
                  label="Continue with Google"
                  onPress={() => {}}
                />
              </View>

              {Boolean(error) && <Text style={styles.error}>{error}</Text>}

              <PressableScale
                pressedScale={0.99}
                style={styles.footerWrap}
                onPress={() => {
                  setTimeout(() => {
                    navigation.navigate("Signup");
                  }, 130);
                }}
              >
                <Text style={styles.footer}>
                  Don't have an account? <Text style={styles.link}>Sign Up</Text>
                </Text>
              </PressableScale>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}