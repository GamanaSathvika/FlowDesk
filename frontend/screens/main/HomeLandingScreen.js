// screens/main/HomeLandingScreen.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_TASKS = [
  { id: 1, title: 'Design system review',          time: '10:00 AM', tag: 'High',   done: true  },
  { id: 2, title: 'Sync with Priya on onboarding', time: '12:30 PM', tag: 'Medium', done: true  },
  { id: 3, title: 'Update dashboard components',   time: '3:00 PM',  tag: 'High',   done: false },
  { id: 4, title: 'Write release notes for v1.4',  time: '5:00 PM',  tag: 'Medium', done: false },
  { id: 5, title: 'Review pull requests',          time: '6:00 PM',  tag: 'Low',    done: false },
];


const WEEKLY_BARS = [
  { day: 'M', height: 32, active: false },
  { day: 'T', height: 44, active: false },
  { day: 'W', height: 28, active: false },
  { day: 'T', height: 52, active: true  },
  { day: 'F', height: 38, active: false },
  { day: 'S', height: 20, active: false },
  { day: 'S', height: 14, active: false, today: true },
];

const TAG_STYLES = {
  High:   { bg: '#FEF2F2', text: '#DC2626' },
  Medium: { bg: '#FFFBEB', text: '#D97706' },
  Low:    { bg: '#F0FDF4', text: '#16A34A' },
};

// ─── Circular Progress Ring ───────────────────────────────────────────────────

function ProgressRing({ pct = 60, size = 88, stroke = 7 }) {
  const r             = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset        = circumference - (pct / 100) * circumference;
  const center        = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={r} stroke="#F3F4F6" strokeWidth={stroke} fill="none" />
        <Circle
          cx={center} cy={center} r={r}
          stroke="#3B82F6" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${center},${center}`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={s.ringCenter}>
          <Text style={s.ringPct}>{pct}%</Text>
          <Text style={s.ringLabel}>done</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, link, onLinkPress }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {link ? (
        <Pressable onPress={onLinkPress} hitSlop={12}>
          <Text style={s.sectionLink}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({ task, onToggle }) {
  const tag = TAG_STYLES[task.tag] || TAG_STYLES.Low;
  return (
    <View style={s.taskRow}>
      <Pressable
        onPress={() => onToggle(task.id)}
        hitSlop={10}
        style={[s.taskCheck, task.done ? s.taskCheckDone : s.taskCheckUndone]}
      >
        {task.done && <Ionicons name="checkmark" size={12} color="#fff" />}
      </Pressable>

      <View style={s.taskBody}>
        <Text style={[s.taskTitle, task.done && s.taskTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={s.taskMeta}>Due {task.time}</Text>
      </View>

      <View style={[s.taskTag, { backgroundColor: tag.bg }]}>
        <Text style={[s.taskTagText, { color: tag.text }]}>{task.tag}</Text>
      </View>
    </View>
  );
}

// ─── Home Landing Screen ──────────────────────────────────────────────────────

export default function HomeLandingScreen({ profile, onNavigate }) {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Toggle a task's done state
  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  // Progress derived from live task state
  const doneCount = useMemo(() => tasks.filter(t => t.done).length, [tasks]);
  const pct       = useMemo(() => Math.round((doneCount / tasks.length) * 100), [doneCount, tasks.length]);

  // Greeting name — falls back to 'Gamana' if no profile yet
  const displayName = profile?.name?.split(' ')[0] || 'Gamana';

  // Tab navigation — delegates to App.js setActiveTab
  const goTo = useCallback((tab) => {
    if (typeof onNavigate === 'function') onNavigate(tab);
  }, [onNavigate]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── 1. Header ── */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Ionicons name="flash" size={18} color="#3B82F6" />
            </View>
            <Text style={s.appName}>FlowDesk</Text>
          </View>
          <Pressable style={s.iconBtn} hitSlop={8} onPress={() => goTo('settings')}>
            <Ionicons name="settings-outline" size={19} color="#6B7280" />
          </Pressable>
        </View>

        {/* ── 2. Greeting ── */}
        <View style={s.greeting}>
          <Text style={s.greetingMain}>Good Evening, {displayName}</Text>
          <Text style={s.greetingSub}>Let's make today count.</Text>
        </View>

        {/* ── 3. Progress Card — live pct updates as tasks toggle ── */}
        <View style={s.progressCard}>
          <ProgressRing pct={pct} size={88} stroke={7} />
          <View style={s.progressInfo}>
            <Text style={s.progressEyebrow}>TODAY'S PROGRESS</Text>
            <Text style={s.progressHeading}>{doneCount} of {tasks.length} tasks</Text>
            <Text style={s.progressSub}>completed today</Text>
            <View style={s.progressBarRow}>
              <View style={s.progressBarBg}>
                <View style={[s.progressBarFill, { width: `${pct}%` }]} />
              </View>
              <Text style={s.progressBarPct}>{pct}%</Text>
            </View>
          </View>
        </View>

        {/* ── 4. Today's Tasks ── */}
        <SectionHeader
          title="Today's Tasks"
          link="See all"
          onLinkPress={() => goTo('tasks')}
        />
        <View style={s.tasksList}>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </View>

        {/* ── 6. Focus Card ── */}
        <View style={s.focusCard}>
          <View>
            <Text style={s.focusEyebrow}>FOCUS TIME TODAY</Text>
            <Text style={s.focusTime}>1h 20m</Text>
            <Text style={s.focusSub}>2 sessions completed</Text>
          </View>
          <Pressable
            onPress={() => goTo('focus')}
            style={({ pressed }) => [s.focusBtn, pressed && s.focusBtnPressed]}
          >
            <Ionicons name="timer-outline" size={15} color="#fff" />
            <Text style={s.focusBtnText}>Start Session</Text>
          </Pressable>
        </View>

        {/* ── 7. Analytics Preview ── */}
        <SectionHeader
          title="Weekly Progress"
          link="Details"
          onLinkPress={() => goTo('analytics')}
        />
        <View style={s.analyticsCard}>
          <View style={s.analyticsHead}>
            <Text style={s.analyticsTitle}>Tasks completed this week</Text>
            <View style={s.analyticsBadge}>
              <Text style={s.analyticsBadgeText}>+18%</Text>
            </View>
          </View>

          <View style={s.barsRow}>
            {WEEKLY_BARS.map((bar, i) => (
              <View key={i} style={s.barCol}>
                <View
                  style={[
                    s.barFill,
                    {
                      height: bar.height,
                      backgroundColor: bar.active
                        ? '#3B82F6'
                        : bar.today
                        ? '#EFF6FF'
                        : i > 4
                        ? '#DBEAFE'
                        : '#93C5FD',
                      borderWidth:  bar.today ? 1 : 0,
                      borderColor:  bar.today ? '#BFDBFE' : 'transparent',
                      borderStyle:  bar.today ? 'dashed'  : 'solid',
                    },
                  ]}
                />
                <Text style={s.barDay}>{bar.day}</Text>
              </View>
            ))}
          </View>

          <View style={s.analyticsStats}>
            <Pressable style={s.analyticsStatItem} onPress={() => goTo('analytics')}>
              <Text style={s.aStatVal}>34</Text>
              <Text style={s.aStatLbl}>Tasks done</Text>
            </Pressable>
            <View style={s.aStatDivider} />
            <Pressable style={s.analyticsStatItem} onPress={() => goTo('focus')}>
              <Text style={s.aStatVal}>6h 40m</Text>
              <Text style={s.aStatLbl}>Focus time</Text>
            </Pressable>
            <View style={s.aStatDivider} />
            <Pressable style={s.analyticsStatItem} onPress={() => goTo('analytics')}>
              <Text style={s.aStatVal}>82%</Text>
              <Text style={s.aStatLbl}>Completion</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 16 }} />
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
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 20,
    paddingBottom: 12,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 34, height: 34,
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.4 },
  iconBtn: {
    width: 36, height: 36, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  greeting:     { paddingHorizontal: 20, paddingBottom: 20 },
  greetingMain: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5, lineHeight: 28 },
  greetingSub:  { fontSize: 13, color: '#6B7280', marginTop: 4 },

  progressCard: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: '#E5E7EB',
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  ringCenter:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ringPct:         { fontSize: 18, fontWeight: '800', color: '#111827', lineHeight: 22 },
  ringLabel:       { fontSize: 9, color: '#9CA3AF', fontWeight: '500', marginTop: 1, letterSpacing: 0.3 },
  progressInfo:    { flex: 1 },
  progressEyebrow: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2, marginBottom: 4 },
  progressHeading: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 2 },
  progressSub:     { fontSize: 12, color: '#6B7280' },
  progressBarRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  progressBarBg:   { flex: 1, height: 5, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 99 },
  progressBarPct:  { fontSize: 11, fontWeight: '700', color: '#3B82F6' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12, paddingTop: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sectionLink:  { fontSize: 12, fontWeight: '600', color: '#3B82F6' },

  tasksList: { paddingHorizontal: 16, gap: 8, marginBottom: 20 },
  taskRow: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14, padding: 13,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  taskCheck:       { width: 22, height: 22, borderRadius: 7, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  taskCheckDone:   { backgroundColor: '#3B82F6' },
  taskCheckUndone: { borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: '#fff' },
  taskBody:        { flex: 1 },
  taskTitle:       { fontSize: 13, fontWeight: '600', color: '#111827', lineHeight: 18 },
  taskTitleDone:   { color: '#9CA3AF', textDecorationLine: 'line-through' },
  taskMeta:        { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  taskTag:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  taskTagText:     { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },

  focusCard: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: '#3B82F6', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#3B82F6', shadowOpacity: 0.32, shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  focusEyebrow: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2, marginBottom: 4 },
  focusTime:    { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  focusSub:     { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  focusBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11,
  },
  focusBtnPressed: { backgroundColor: 'rgba(255,255,255,0.28)' },
  focusBtnText:    { fontSize: 12, fontWeight: '700', color: '#fff' },

  analyticsCard: {
    marginHorizontal: 16, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  analyticsHead:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  analyticsTitle:     { fontSize: 13, fontWeight: '700', color: '#111827' },
  analyticsBadge:     { backgroundColor: '#F0FDF4', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  analyticsBadgeText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  barsRow:  { flexDirection: 'row', alignItems: 'flex-end', height: 68, gap: 6, marginBottom: 14 },
  barCol:   { flex: 1, alignItems: 'center', gap: 5, justifyContent: 'flex-end' },
  barFill:  { width: '100%', borderRadius: 5 },
  barDay:   { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  analyticsStats:    { flexDirection: 'row', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  analyticsStatItem: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  aStatDivider:      { width: 1, height: 28, backgroundColor: '#F3F4F6' },
  aStatVal:          { fontSize: 15, fontWeight: '800', color: '#111827' },
  aStatLbl:          { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
});