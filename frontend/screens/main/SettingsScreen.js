// screens/main/SettingsScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Focus Duration Options ───────────────────────────────────────────────────
const FOCUS_OPTIONS = ['15 min', '25 min', '30 min', '45 min', '60 min'];

// ─── Avatar Initials ──────────────────────────────────────────────────────────
function AvatarCircle({ name, size = 90 }) {
  const initials = name
    .trim()
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <View style={[av.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[av.text, { fontSize: size * 0.36 }]}>{initials || '?'}</Text>
    </View>
  );
}

const av = StyleSheet.create({
  circle: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: { color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
});

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ─── Editable Field ───────────────────────────────────────────────────────────
function EditField({ label, value, onChange, placeholder, keyboardType = 'default', multiline = false, required = false, error = false }) {
  return (
    <View style={s.fieldWrap}>
      <View style={s.fieldLabelRow}>
        <Text style={s.fieldLabel}>{label}</Text>
        {required && <Text style={s.requiredBadge}>Required</Text>}
      </View>
      <TextInput
        style={[s.fieldInput, multiline && s.fieldInputMulti, error && s.fieldInputError]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={false}
      />
      {error && (
        <Text style={s.fieldError}>At least one of email or phone is required</Text>
      )}
    </View>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ icon, iconColor, iconBg, label, sublabel, value, onChange, last = false }) {
  return (
    <View style={[s.toggleRow, !last && s.toggleRowBorder]}>
      <View style={[s.toggleIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View style={s.toggleText}>
        <Text style={s.toggleLabel}>{label}</Text>
        {sublabel ? <Text style={s.toggleSub}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
        thumbColor={value ? '#3B82F6' : '#D1D5DB'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

// ─── Focus Duration Picker ────────────────────────────────────────────────────
function FocusPicker({ value, onChange }) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>Preferred Focus Duration</Text>
      <View style={s.focusRow}>
        {FOCUS_OPTIONS.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[s.focusChip, value === opt && s.focusChipActive]}
          >
            <Text style={[s.focusChipText, value === opt && s.focusChipTextActive]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
export default function SettingsScreen({ profile, onSave, onNavigate }) {
  // ── Local editable state (uncommitted until Save) ──
  const [form, setForm] = useState({
    name:          profile?.name          ?? 'Gamana',
    email:         profile?.email         ?? '',
    phone:         profile?.phone         ?? '',
    bio:           profile?.bio           ?? '',
    org:           profile?.org           ?? '',
    focusDuration: profile?.focusDuration ?? '25 min',
  });

  const [settings, setSettings] = useState({
    notifications:   profile?.settings?.notifications   ?? true,
    darkMode:        profile?.settings?.darkMode         ?? false,
    reminderAlerts:  profile?.settings?.reminderAlerts   ?? true,
    focusSound:      profile?.settings?.focusSound       ?? true,
  });

  const [errors, setErrors]       = useState({});
  const [saved,  setSaved]        = useState(false);
  const [editingName, setEditingName] = useState(false);

  const setField = useCallback((key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: false }));
    setSaved(false);
  }, []);

  const toggleSetting = useCallback((key) => {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  }, []);

  // ── Validate & Save ──
  const handleSave = useCallback(() => {
    const newErrors = {};
    const emailOk = form.email.trim().length > 0;
    const phoneOk = form.phone.trim().length > 0;

    if (!form.name.trim()) newErrors.name = true;
    if (!emailOk && !phoneOk) {
      newErrors.email = true;
      newErrors.phone = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave?.({ ...form, settings });
    setSaved(true);
  }, [form, settings, onSave]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of FlowDesk?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => onNavigate?.('logout') },
      ]
    );
  }, [onNavigate]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable onPress={() => onNavigate?.('home')} style={s.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </Pressable>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── 1. Avatar & Name ── */}
        <View style={s.avatarSection}>
          <Pressable
            onPress={() => Alert.alert('Change Photo', 'Photo picker coming soon')}
            style={s.avatarWrap}
          >
            <AvatarCircle name={form.name || 'U'} size={90} />
            <View style={s.avatarEditBadge}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </Pressable>

          {editingName ? (
            <View style={s.nameEditRow}>
              <TextInput
                style={s.nameInput}
                value={form.name}
                onChangeText={(t) => setField('name', t)}
                autoFocus
                onBlur={() => setEditingName(false)}
                onSubmitEditing={() => setEditingName(false)}
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} style={s.nameRow}>
              <Text style={s.nameText}>{form.name || 'Tap to set name'}</Text>
              <Ionicons name="pencil-outline" size={14} color="#3B82F6" style={{ marginLeft: 6 }} />
            </Pressable>
          )}
          <Text style={s.avatarHint}>Tap avatar to change photo · Tap name to edit</Text>
        </View>

        {/* ── 2. Profile Details ── */}
        <Text style={s.sectionLabel}>PROFILE</Text>
        <SectionCard>
          <EditField
            label="Full Name"
            value={form.name}
            onChange={(t) => setField('name', t)}
            placeholder="Your full name"
            error={errors.name}
          />
          <View style={s.divider} />
          <EditField
            label="Email Address"
            value={form.email}
            onChange={(t) => setField('email', t)}
            placeholder="you@example.com"
            keyboardType="email-address"
            required
            error={errors.email}
          />
          <View style={s.divider} />
          <EditField
            label="Phone Number"
            value={form.phone}
            onChange={(t) => setField('phone', t)}
            placeholder="+91 00000 00000"
            keyboardType="phone-pad"
            required
            error={errors.phone}
          />
          {(errors.email || errors.phone) && (
            <View style={s.contactError}>
              <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
              <Text style={s.contactErrorText}>At least one contact method (email or phone) is required.</Text>
            </View>
          )}
        </SectionCard>

        {/* ── 3. Additional Details ── */}
        <Text style={s.sectionLabel}>ADDITIONAL INFO</Text>
        <SectionCard>
          <EditField
            label="Bio"
            value={form.bio}
            onChange={(t) => setField('bio', t)}
            placeholder="A short bio about yourself…"
            multiline
          />
          <View style={s.divider} />
          <EditField
            label="College / Organization"
            value={form.org}
            onChange={(t) => setField('org', t)}
            placeholder="Where do you work or study?"
          />
          <View style={s.divider} />
          <FocusPicker
            value={form.focusDuration}
            onChange={(v) => setField('focusDuration', v)}
          />
        </SectionCard>

        {/* ── 4. Settings Toggles ── */}
        <Text style={s.sectionLabel}>PREFERENCES</Text>
        <SectionCard>
          <ToggleRow
            icon="notifications-outline"
            iconColor="#3B82F6"
            iconBg="#EFF6FF"
            label="Notifications"
            sublabel="Task reminders & updates"
            value={settings.notifications}
            onChange={() => toggleSetting('notifications')}
          />
          <ToggleRow
            icon="moon-outline"
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            label="Dark Mode"
            sublabel="Easy on the eyes at night"
            value={settings.darkMode}
            onChange={() => toggleSetting('darkMode')}
          />
          <ToggleRow
            icon="alarm-outline"
            iconColor="#D97706"
            iconBg="#FFFBEB"
            label="Reminder Alerts"
            sublabel="Before task deadlines"
            value={settings.reminderAlerts}
            onChange={() => toggleSetting('reminderAlerts')}
          />
          <ToggleRow
            icon="musical-notes-outline"
            iconColor="#16A34A"
            iconBg="#F0FDF4"
            label="Focus Sound"
            sublabel="Ambient sound during sessions"
            value={settings.focusSound}
            onChange={() => toggleSetting('focusSound')}
            last
          />
        </SectionCard>

        {/* ── 5. Actions ── */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [s.saveBtn, pressed && s.saveBtnPressed]}
        >
          <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={18} color="#fff" />
          <Text style={s.saveBtnText}>{saved ? 'Changes Saved!' : 'Save Changes'}</Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [s.logoutBtn, pressed && s.logoutBtnPressed]}
        >
          <Ionicons name="log-out-outline" size={17} color="#EF4444" />
          <Text style={s.logoutBtnText}>Log Out</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingHorizontal: 16 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },

  // ── Avatar section ──
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#F9FAFB',
  },
  nameRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  nameText:   { fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: -0.4 },
  nameEditRow: { marginBottom: 6, width: '60%' },
  nameInput: {
    fontSize: 20, fontWeight: '800', color: '#111827',
    borderBottomWidth: 2, borderBottomColor: '#3B82F6',
    paddingVertical: 4, textAlign: 'center',
  },
  avatarHint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },

  // ── Section label ──
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.4,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },

  // ── Card ──
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 2 },

  // ── Fields ──
  fieldWrap:       { paddingVertical: 12 },
  fieldLabelRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  fieldLabel:      { fontSize: 12, fontWeight: '600', color: '#374151' },
  requiredBadge: {
    fontSize: 9, fontWeight: '700', color: '#2563EB',
    backgroundColor: '#EFF6FF', borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2, letterSpacing: 0.4,
  },
  fieldInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#111827', fontWeight: '500',
  },
  fieldInputMulti: { height: 80, textAlignVertical: 'top' },
  fieldInputError: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  fieldError:      { fontSize: 11, color: '#DC2626', marginTop: 5 },

  contactError: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 9, padding: 10, marginTop: 4, marginBottom: 6,
    borderWidth: 1, borderColor: '#FECACA',
  },
  contactErrorText: { fontSize: 12, color: '#DC2626', flex: 1, lineHeight: 17 },

  // ── Focus chips ──
  focusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  focusChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 9, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  focusChipActive: {
    backgroundColor: '#EFF6FF', borderColor: '#3B82F6',
  },
  focusChipText:       { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  focusChipTextActive: { color: '#2563EB' },

  // ── Toggle rows ──
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, gap: 12,
  },
  toggleRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  toggleIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleText:  { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  toggleSub:   { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  // ── Buttons ──
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 14, paddingVertical: 15,
    marginTop: 24,
    shadowColor: '#3B82F6', shadowOpacity: 0.3,
    shadowRadius: 14, shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  saveBtnPressed: { backgroundColor: '#2563EB', shadowOpacity: 0.15 },
  saveBtnText:    { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 14, paddingVertical: 14, marginTop: 12,
  },
  logoutBtnPressed: { backgroundColor: '#FEE2E2' },
  logoutBtnText:    { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});