// SignUpScreen.js
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';

const KeyboardContainer = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

// Reusable Auth Input Component
const AuthInput = memo(function AuthInput({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  inputRef,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={s.fieldBlock}>
      <Text style={s.fieldLabel}>{label}</Text>

      <View style={[s.shell, isFocused && s.shellFocused]}>
        <Ionicons
          name={icon}
          size={18}
          color={isFocused ? '#3B82F6' : '#9CA3AF'}
          style={s.leadIcon}
        />

        <TextInput
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={s.textInput}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={hidden}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          placeholderTextColor="#D1D5DB"
        />

        {secureTextEntry && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={8}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#9CA3AF"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
});

export default function SignUpScreen({ navigation }) {
  const emailRef    = useRef(null);
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleName     = useCallback((t) => setForm((p) => ({ ...p, name: t })), []);
  const handleEmail    = useCallback((t) => setForm((p) => ({ ...p, email: t })), []);
  const handlePassword = useCallback((t) => setForm((p) => ({ ...p, password: t })), []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Subtle blue accent orbs */}
      <View style={[s.orb, s.orbTR]} pointerEvents="none" />
      <View style={[s.orb, s.orbBL]} pointerEvents="none" />

      <KeyboardContainer style={s.flex}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & App Name */}
          <View style={s.logoContainer}>
            <View style={s.logoIconWrap}>
              <Image
                source={require('../../assets/icon.png')}
                style={s.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={s.appName}>FlowDesk</Text>
          </View>

          <View style={s.card}>
            {/* New Account Badge */}
            <View style={s.badge}>
              <View style={s.badgeDot} />
              <Text style={s.badgeText}>NEW ACCOUNT</Text>
            </View>

            <Text style={s.title}>Create Account</Text>
            <Text style={s.subtitle}>Join thousands managing tasks smarter</Text>

            <AuthInput
              label="Full Name"
              placeholder="Your full name"
              icon="person-outline"
              value={form.name}
              onChangeText={handleName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <AuthInput
              label="Email"
              placeholder="you@example.com"
              icon="mail-outline"
              value={form.email}
              onChangeText={handleEmail}
              inputRef={emailRef}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <AuthInput
              label="Password"
              placeholder="Create a strong password"
              icon="lock-closed-outline"
              value={form.password}
              onChangeText={handlePassword}
              secureTextEntry
              inputRef={passwordRef}
              returnKeyType="done"
            />

            <GradientButton label="Create Account" onPress={() => {}} />

            {/* Terms */}
            <Text style={s.terms}>
              By signing up you agree to our{' '}
              <Text style={s.termsLink}>Terms</Text>
              {' & '}
              <Text style={s.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Navigation to Login */}
            <Pressable
              onPress={() => navigation?.navigate('Login')}
              style={s.switchRow}
            >
              <Text style={s.switchText}>
                Already have an account?{'  '}
                <Text style={s.switchAccent}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardContainer>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },

  orb: { position: 'absolute', borderRadius: 999 },
  orbTR: { top: -100, right: -80, width: 280, height: 280, backgroundColor: 'rgba(59,130,246,0.08)' },
  orbBL: { bottom: -100, left: -80, width: 300, height: 300, backgroundColor: 'rgba(59,130,246,0.05)' },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logo: {
    width: 52,
    height: 52,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#3B82F6' },
  badgeText: { color: '#3B82F6', fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
    lineHeight: 20,
  },

  fieldBlock: { marginBottom: 18 },
  fieldLabel: {
    color: '#374151',
    marginBottom: 7,
    fontSize: 14,
    fontWeight: '600',
  },

  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  shellFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },

  leadIcon: { marginRight: 12 },
  textInput: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
  },

  terms: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: { color: '#3B82F6', fontWeight: '600' },

  switchRow: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 4,
  },
  switchText: { color: '#6B7280', fontSize: 14 },
  switchAccent: { color: '#3B82F6', fontWeight: '700' },
});