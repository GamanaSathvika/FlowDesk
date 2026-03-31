import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import AuthHeader from './components/AuthHeader';
import BottomTabBar from './components/BottomTabBar/BottomTabBar';
import DividerOr from './components/DividerOr';
import GradientButton from './components/GradientButton';
import InputField from './components/InputField';
import PressableScale from './components/PressableScale';
import SecondaryButton from './components/SecondaryButton';
import { palette, styles } from './App.styles';
import HomeLandingScreen from './screens/main/HomeLandingScreen';
import TasksScreen from './screens/main/TasksScreen';
import FocusScreen from './screens/main/FocusScreen';
import AnalyticsScreen from './screens/main/AnalyticsScreen';

const initialLoginState = {
  email: '',
  password: '',
};

const initialSignupState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function App() {
  const [isSignup, setIsSignup] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const [loginData, setLoginData] = useState(initialLoginState);
  const [signupData, setSignupData] = useState(initialSignupState);

  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');

  const activeTitle = isSignup ? 'Create your account' : 'Welcome back 👋';
  const activeSubtitle = isSignup
    ? 'Build your calm, focused workflow.'
    : 'Sign in to continue your focused work.';

  const onLogin = () => {
    if (!loginData.email.trim() || !loginData.password.trim()) {
      setLoginError('Please fill in email and password.');
      return;
    }
    if (!emailRegex.test(loginData.email.trim().toLowerCase())) {
      setLoginError('Enter a valid email address.');
      return;
    }
    setLoginError('');
    setIsAuthed(true);
  };

  const onSignup = () => {
    if (
      !signupData.name.trim() ||
      !signupData.email.trim() ||
      !signupData.password.trim() ||
      !signupData.confirmPassword.trim()
    ) {
      setSignupError('Please complete all fields.');
      return;
    }
    if (!emailRegex.test(signupData.email.trim().toLowerCase())) {
      setSignupError('Enter a valid email address.');
      return;
    }
    if (signupData.password.trim().length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }
    setSignupError('');
    setIsAuthed(true);
  };

  const currentError = useMemo(() => (isSignup ? signupError : loginError), [isSignup, signupError, loginError]);

  if (isAuthed) {
    const screenByTab = {
      home: <HomeLandingScreen />,
      tasks: <TasksScreen />,
      focus: <FocusScreen />,
      analytics: <AnalyticsScreen />,
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[palette.bgTop, '#EEF3FF', palette.bgBottom]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.backgroundRoot}
        >
          <View style={[styles.abstractShape, styles.abstractShapeTop]} />
          <View style={[styles.abstractShape, styles.abstractShapeMid]} />
          <View style={[styles.abstractShape, styles.abstractShapeBottom]} />

          <View style={{ flex: 1 }}>
            <Animated.View
              key={activeTab}
              entering={FadeInDown.duration(260)}
              exiting={FadeOut.duration(160)}
              style={{ flex: 1 }}
            >
              {screenByTab[activeTab] ?? screenByTab.home}
            </Animated.View>
          </View>

          <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <LinearGradient
          colors={[palette.bgTop, '#EEF3FF', palette.bgBottom]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.backgroundRoot}
        >
          <View style={[styles.abstractShape, styles.abstractShapeTop]} />
          <View style={[styles.abstractShape, styles.abstractShapeMid]} />
          <View style={[styles.abstractShape, styles.abstractShapeBottom]} />
        </LinearGradient>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(520)} style={styles.card}>
            <AuthHeader subtitle={activeTitle} />
            <Text style={styles.subheading}>{activeSubtitle}</Text>

            <View style={styles.formWrap}>
              {!isSignup ? (
                <Animated.View key="login" entering={FadeInUp.duration(260)} style={styles.formPanel}>
                  <InputField
                    icon="mail-outline"
                    placeholder="Email"
                    value={loginData.email}
                    onChangeText={(text) => setLoginData((prev) => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    textContentType="username"
                    autoComplete="email"
                  />
                  <InputField
                    icon="lock-closed-outline"
                    placeholder="Password"
                    value={loginData.password}
                    onChangeText={(text) => setLoginData((prev) => ({ ...prev, password: text }))}
                    secure
                    textContentType="password"
                    autoComplete="password"
                  />

                  <PressableScale pressedScale={0.99} style={styles.forgotWrap}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </PressableScale>

                  <GradientButton label="Login" onPress={onLogin} />
                  <DividerOr />
                  <SecondaryButton label="Continue with Google" onPress={() => {}} />
                </Animated.View>
              ) : (
                <Animated.View key="signup" entering={FadeInUp.duration(260)} style={styles.formPanel}>
                  <InputField
                    icon="person-outline"
                    placeholder="Name"
                    value={signupData.name}
                    onChangeText={(text) => setSignupData((prev) => ({ ...prev, name: text }))}
                    autoCapitalize="words"
                    textContentType="name"
                    autoComplete="name"
                  />
                  <InputField
                    icon="mail-outline"
                    placeholder="Email"
                    value={signupData.email}
                    onChangeText={(text) => setSignupData((prev) => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    textContentType="username"
                    autoComplete="email"
                  />
                  <InputField
                    icon="lock-closed-outline"
                    placeholder="Password"
                    value={signupData.password}
                    onChangeText={(text) => setSignupData((prev) => ({ ...prev, password: text }))}
                    secure
                    textContentType="newPassword"
                    autoComplete="new-password"
                  />
                  <InputField
                    icon="shield-checkmark-outline"
                    placeholder="Confirm Password"
                    value={signupData.confirmPassword}
                    onChangeText={(text) => setSignupData((prev) => ({ ...prev, confirmPassword: text }))}
                    secure
                    textContentType="newPassword"
                    autoComplete="new-password"
                  />

                  <GradientButton label="Create Account" onPress={onSignup} style={styles.primaryBtn} />
                </Animated.View>
              )}
            </View>

            {Boolean(currentError) && <Text style={styles.errorText}>{currentError}</Text>}

            <PressableScale onPress={() => setIsSignup((prev) => !prev)} pressedScale={0.99} style={styles.footerSwitch}>
              <Text style={styles.footerText}>
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.footerAction}>{isSignup ? 'Login' : 'Sign Up'}</Text>
              </Text>
            </PressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default App;
