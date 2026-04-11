// LoginScreen.js
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import SecondaryButton from '../components/SecondaryButton';

const KeyboardContainer = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

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

export default function LoginScreen({ navigation }) {
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

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
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to continue your productivity journey</Text>

            <AuthInput
              label="Email"
              placeholder="you@example.com"
              icon="mail-outline"
              value={form.email}
              onChangeText={handleEmail}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <AuthInput
              label="Password"
              placeholder="Enter your password"
              icon="lock-closed-outline"
              value={form.password}
              onChangeText={handlePassword}
              secureTextEntry
              inputRef={passwordRef}
              returnKeyType="done"
            />

            {/* Forgot Password */}
            <Pressable style={s.forgot} hitSlop={8}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </Pressable>

            <GradientButton label="Sign In" onPress={() => {}} />

            {/* Divider */}
            <View style={s.divRow}>
              <View style={s.divLine} />
              <Text style={s.divText}>or</Text>
              <View style={s.divLine} />
            </View>

            <SecondaryButton label="Continue with Google" onPress={() => {}} />

            {/* Navigation to Signup */}
            <Pressable
              onPress={() => navigation?.navigate('SignUp')}
              style={s.switchRow}
            >
              <Text style={s.switchText}>
                Don't have an account?{'  '}
                <Text style={s.switchAccent}>Sign up</Text>
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

  forgot: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 20,
  },
  forgotText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },

  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  divLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  divText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },

  switchRow: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 4,
  },
  switchText: { color: '#6B7280', fontSize: 14 },
  switchAccent: { color: '#3B82F6', fontWeight: '700' },
});