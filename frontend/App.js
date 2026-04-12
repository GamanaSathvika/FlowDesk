/**
 * App.js — FLOWDESK · Clean White & Blue Theme
 *
 * ═══ KEYBOARD BUG FIXES ══════════════════════════════════════════════════════
 * FIX 1 — AuthKeyboardContainer at MODULE SCOPE (prevents subtree remount)
 * FIX 2 — Reanimated descriptors at MODULE SCOPE (prevents input focus loss)
 * FIX 3 — Stable onChangeText with useCallback (prevents unnecessary re-renders)
 * FIX 4 — Background as absoluteFill sibling, NOT inside KAV
 * ═════════════════════════════════════════════════════════════════════════════
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';

import Animated, { FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from './components/BottomTabBar/BottomTabBar';
import InputField from './components/InputField';
import HomeLandingScreen from './screens/main/HomeLandingScreen';
import TasksScreen from './screens/main/TasksScreen';
import FocusScreen from './screens/main/FocusScreen';
import AnalyticsScreen from './screens/main/AnalyticsScreen';
import SettingsScreen from './screens/main/SettingsScreen';

import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── FIX 1 & 2: Module-scope stable references ───────────────────────────────
const AuthKeyboardContainer = View;
const authCardEntering = Platform.OS === 'android' ? undefined : FadeInDown.duration(420);
const authFormEntering = Platform.OS === 'android' ? undefined : FadeInUp.duration(260);
// ─────────────────────────────────────────────────────────────────────────────

const initialLogin  = { email: '', password: '' };
const initialSignup = { name: '', email: '', password: '', confirmPassword: '' };
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Blue Primary Button ──────────────────────────────────────────────────────
function PrimaryButton({ label, onPress, loading = false }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[btn.primary, pressed && btn.primaryPressed]}
      disabled={loading}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={btn.primaryText}>{label}</Text>
      }
    </Pressable>
  );
}

// ─── Google / Secondary Button ────────────────────────────────────────────────
function GoogleButton({ onPress }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[btn.google, pressed && btn.googlePressed]}
    >
      <Text style={btn.googleG}>G</Text>
      <Text style={btn.googleText}>Continue with Google</Text>
    </Pressable>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [isSignup,  setIsSignup]  = useState(false);
  const [isAuthed,  setIsAuthed]  = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // ─── Shared profile state (passed to Home + Settings) ───────────────────
  const [profile, setProfile] = useState({
    name: 'Gamana',
    email: '',
    phone: '',
    bio: '',
    org: '',
    focusDuration: '25 min',
    settings: {
      notifications:  true,
      darkMode:       false,
      reminderAlerts: true,
      focusSound:     true,
    },
  });

  const handleSaveProfile = useCallback((updated) => {
    setProfile(updated);
  }, []);

  const [loginData,  setLoginData]  = useState(initialLogin);
  const [signupData, setSignupData] = useState(initialSignup);
  const [loginErr,   setLoginErr]   = useState('');
  const [signupErr,  setSignupErr]  = useState('');

  const loginPassRef   = useRef(null);
  const signupEmailRef = useRef(null);
  const signupPassRef  = useRef(null);
  const signupConfRef  = useRef(null);

  // ─── FIX 3: Stable handlers ─────────────────────────────────────────────
  const onLoginEmail    = useCallback((t) => { setLoginData((p)  => ({ ...p, email: t }));           setLoginErr('');  }, []);
  const onLoginPass     = useCallback((t) => { setLoginData((p)  => ({ ...p, password: t }));        setLoginErr('');  }, []);
  const onSignupName    = useCallback((t) => { setSignupData((p) => ({ ...p, name: t }));            setSignupErr(''); }, []);
  const onSignupEmail   = useCallback((t) => { setSignupData((p) => ({ ...p, email: t }));           setSignupErr(''); }, []);
  const onSignupPass    = useCallback((t) => { setSignupData((p) => ({ ...p, password: t }));        setSignupErr(''); }, []);
  const onSignupConfirm = useCallback((t) => { setSignupData((p) => ({ ...p, confirmPassword: t })); setSignupErr(''); }, []);
  // ────────────────────────────────────────────────────────────────────────

  const onLogin = useCallback(() => {
    const { email, password } = loginData;
    if (!email.trim() || !password.trim()) { setLoginErr('Please fill in your email and password.'); return; }
    if (!emailRe.test(email.trim().toLowerCase())) { setLoginErr('Enter a valid email address.'); return; }
    setLoginErr('');
    setIsAuthed(true);
  }, [loginData]);

  const onSignup = useCallback(() => {
    const { name, email, password, confirmPassword } = signupData;
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) { setSignupErr('Please complete all fields.'); return; }
    if (!emailRe.test(email.trim().toLowerCase())) { setSignupErr('Enter a valid email address.'); return; }
    if (password.trim().length < 6) { setSignupErr('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setSignupErr('Passwords do not match.'); return; }
    setSignupErr('');
    setIsAuthed(true);
  }, [signupData]);

  const currentError = useMemo(
    () => (isSignup ? signupErr : loginErr),
    [isSignup, signupErr, loginErr],
  );

  // ─── Authenticated shell ─────────────────────────────────────────────────
  if (isAuthed) {
    // 'settings' and 'logout' are overlay routes, not tab bar items
    const handleNavigate = (tab) => {
      if (tab === 'logout') {
        setIsAuthed(false);
        setActiveTab('home');
        return;
      }
      setActiveTab(tab);
    };

    if (activeTab === 'settings') {
      return (
        <SafeAreaView style={s.safe}>
          <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
          <SettingsScreen
            profile={profile}
            onSave={handleSaveProfile}
            onNavigate={handleNavigate}
          />
        </SafeAreaView>
      );
    }

    const screenByTab = {
      home:      <HomeLandingScreen profile={profile} onNavigate={handleNavigate} />,
      tasks:     <TasksScreen onNavigate={handleNavigate} />,
      focus:     <FocusScreen onNavigate={handleNavigate} />,
      analytics: <AnalyticsScreen onNavigate={handleNavigate} />,
    };
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={s.flex}>
          <View entering={FadeInDown.duration(240)} exiting={FadeOut.duration(140)} style={s.flex}>
            {screenByTab[activeTab] ?? screenByTab.home}
          </View>
        </View>
        <BottomTabBar activeTab={activeTab} onTabPress={handleNavigate} />
      </SafeAreaView>
    );
  }

  // ─── Auth shell ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Decorative soft-blue orbs */}
      <View style={[s.orb, s.orbTR]} pointerEvents="none" />
      <View style={[s.orb, s.orbBL]} pointerEvents="none" />

      <AuthKeyboardContainer style={s.flex}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
          showsVerticalScrollIndicator={false}
        >
          {/* ── FLOWDESK Wordmark ── */}
          <View style={s.topBar}>
            <View style={s.logoMark}>
              <Ionicons name="flash" size={18} color="#3B82F6" />
            </View>
            <Text style={s.wordmark}>FLOWDESK</Text>
          </View>

          {/* ── Auth Card ── */}
          <View entering={authCardEntering} style={s.card}>

            {isSignup && (
              <View style={s.badge}>
                <View style={s.badgeDot} />
                <Text style={s.badgeText}>NEW ACCOUNT</Text>
              </View>
            )}

            <Text style={s.title}>
              {isSignup ? 'Create your\nworkspace' : 'Welcome back'}
            </Text>
            <Text style={s.subtitle}>
              {isSignup
                ? 'Get set up in under a minute'
                : 'Sign in to continue your focused work'}
            </Text>

            {/* ── Login form ── */}
            {!isSignup ? (
              <View entering={authFormEntering}>
                <InputField
                  icon="mail-outline"
                  label="Email address"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChangeText={onLoginEmail}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => loginPassRef.current?.focus()}
                />
                <InputField
                  ref={loginPassRef}
                  icon="lock-closed-outline"
                  label="Password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChangeText={onLoginPass}
                  secure
                  textContentType="password"
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={onLogin}
                />

                <Pressable style={s.forgot} hitSlop={8}>
                  <Text style={s.forgotText}>Forgot password?</Text>
                </Pressable>

                <PrimaryButton label="Sign In" onPress={onLogin} />

                <View style={s.divRow}>
                  <View style={s.divLine} />
                  <Text style={s.divText}>or</Text>
                  <View style={s.divLine} />
                </View>

                <GoogleButton onPress={() => {}} />
              </View>
            ) : (
              /* ── Signup form ── */
              <View entering={authFormEntering}>
                <InputField
                  icon="person-outline"
                  label="Full name"
                  placeholder="Your name"
                  value={signupData.name}
                  onChangeText={onSignupName}
                  autoCapitalize="words"
                  textContentType="name"
                  autoComplete="name"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => signupEmailRef.current?.focus()}
                />
                <InputField
                  ref={signupEmailRef}
                  icon="mail-outline"
                  label="Email address"
                  placeholder="you@example.com"
                  value={signupData.email}
                  onChangeText={onSignupEmail}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => signupPassRef.current?.focus()}
                />
                <InputField
                  ref={signupPassRef}
                  icon="lock-closed-outline"
                  label="Password"
                  placeholder="Min. 6 characters"
                  value={signupData.password}
                  onChangeText={onSignupPass}
                  secure
                  textContentType="newPassword"
                  autoComplete="new-password"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => signupConfRef.current?.focus()}
                />
                <InputField
                  ref={signupConfRef}
                  icon="shield-checkmark-outline"
                  label="Confirm password"
                  placeholder="Repeat your password"
                  value={signupData.confirmPassword}
                  onChangeText={onSignupConfirm}
                  secure
                  textContentType="newPassword"
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={onSignup}
                />

                <PrimaryButton label="Create Account" onPress={onSignup} />

                <Text style={s.terms}>
                  By signing up you agree to our{' '}
                  <Text style={s.termsLink}>Terms</Text>
                  {' & '}
                  <Text style={s.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            )}

            {/* ── Error ── */}
            {Boolean(currentError) && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                <Text style={s.errorText}>{currentError}</Text>
              </View>
            )}

            {/* ── Switch mode ── */}
            <Pressable onPress={() => setIsSignup((p) => !p)} style={s.switchRow}>
              <Text style={s.switchText}>
                {isSignup ? 'Already have an account?  ' : "Don't have an account?  "}
                <Text style={s.switchAccent}>{isSignup ? 'Sign in' : 'Sign up'}</Text>
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </AuthKeyboardContainer>
    </SafeAreaView>
  );
}

export default App;

// ─── Button styles ────────────────────────────────────────────────────────────
const btn = StyleSheet.create({
  primary: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryPressed: {
    backgroundColor: '#2563EB',
    shadowOpacity: 0.15,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  googlePressed: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  googleG: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },

  orb: { position: 'absolute', borderRadius: 999 },
  orbTR: {
    top: -140, right: -90, width: 320, height: 320,
    backgroundColor: 'rgba(59,130,246,0.07)',
  },
  orbBL: {
    bottom: -130, left: -100, width: 360, height: 360,
    backgroundColor: 'rgba(59,130,246,0.045)',
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 52,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 28,
  },
  logoMark: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#DBEAFE',
    alignItems: 'center', justifyContent: 'center',
  },
  wordmark: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3.5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 26,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#1E40AF',
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },

  badge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#BFDBFE',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    marginBottom: 16,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#3B82F6' },
  badgeText: { color: '#2563EB', fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },

  title: {
    color: '#111827',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 26,
  },

  forgot: { alignSelf: 'flex-end', marginTop: 6, marginBottom: 20 },
  forgotText: { color: '#3B82F6', fontSize: 13, fontWeight: '600' },

  divRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 18, gap: 10,
  },
  divLine: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  divText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },

  terms: {
    color: '#9CA3AF', fontSize: 12,
    textAlign: 'center', marginTop: 16, lineHeight: 19,
  },
  termsLink: { color: '#3B82F6', fontWeight: '600' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    marginTop: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { color: '#DC2626', fontSize: 13, flex: 1, lineHeight: 18 },

  switchRow: { alignItems: 'center', marginTop: 22, paddingVertical: 2 },
  switchText: { color: '#6B7280', fontSize: 14 },
  switchAccent: { color: '#3B82F6', fontWeight: '700' },
});