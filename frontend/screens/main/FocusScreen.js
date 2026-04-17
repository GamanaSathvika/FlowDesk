// screens/main/FocusScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tasksApi } from '../../api/tasks';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES = [
  { key: 'focus', label: 'Focus',       duration: 25 * 60, color: '#3B82F6', bgColor: '#EFF6FF', tip: 'Work for 25 minutes, then take a short break to stay sharp.' },
  { key: 'short', label: 'Short Break', duration:  5 * 60, color: '#16A34A', bgColor: '#F0FDF4', tip: 'Step away, stretch, and rest your eyes for 5 minutes.' },
  { key: 'long',  label: 'Long Break',  duration: 15 * 60, color: '#7C3AED', bgColor: '#F5F3FF', tip: 'Great work! Take 15 minutes to recharge fully.' },
];

const SESSION_STORAGE_KEY = 'focus_session_stats';

const RING_SIZE   = 220;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTimer(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
  return `${m}m`;
}

// ─── Timer Ring ───────────────────────────────────────────────────────────────

function TimerRing({ remaining, total, color, state }) {
  const pct    = total > 0 ? remaining / total : 1;
  const offset = CIRCUMFERENCE * (1 - pct);
  const center = RING_SIZE / 2;

  const stateColor = state === 'paused' ? '#F59E0B' : color;
  const stateLabel =
    state === 'running' ? 'IN PROGRESS' :
    state === 'paused'  ? 'PAUSED'      : 'READY';
  const stateLabelColor =
    state === 'running' ? color      :
    state === 'paused'  ? '#F59E0B'  : '#9CA3AF';

  return (
    <View style={ring.wrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Track */}
        <Circle
          cx={center} cy={center} r={RING_RADIUS}
          stroke="#F3F4F6" strokeWidth={RING_STROKE} fill="none"
        />
        {/* Progress */}
        <Circle
          cx={center} cy={center} r={RING_RADIUS}
          stroke={stateColor} strokeWidth={RING_STROKE} fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${center},${center}`}
        />
      </Svg>

      {/* Center content */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={ring.center}>
          <Text style={ring.time}>{fmtTimer(remaining)}</Text>
          <Text style={[ring.stateLbl, { color: stateLabelColor }]}>{stateLabel}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Task Picker Modal ────────────────────────────────────────────────────────

function TaskPicker({ visible, current, onSelect, onClose, tasks }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tp.overlay} />
      </TouchableWithoutFeedback>
      <View style={tp.sheet}>
        <View style={tp.handle} />
        <Text style={tp.title}>Choose a task</Text>
        <Text style={tp.sub}>What are you focusing on?</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {tasks.map((task) => {
            const active = task === current;
            return (
              <Pressable
                key={task}
                style={({ pressed }) => [tp.row, pressed && tp.rowPressed, active && tp.rowActive]}
                onPress={() => { onSelect(task); onClose(); }}
              >
                <View style={[tp.check, active ? tp.checkActive : tp.checkInactive]}>
                  {active && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[tp.rowText, active && tp.rowTextActive]}>{task}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={tp.cancelBtn} onPress={onClose}>
          <Text style={tp.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// ─── Focus Screen ─────────────────────────────────────────────────────────────

export default function FocusScreen() {
  const [tasks,         setTasks]         = useState([]);
  const [modeIdx,       setModeIdx]       = useState(0);
  const [remaining,     setRemaining]     = useState(MODES[0].duration);
  const [timerState,    setTimerState]    = useState('idle');   // idle | running | paused
  const [currentTask,   setCurrentTask]   = useState('');
  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalFocusSecs,setTotalFocusSecs]= useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);

  const intervalRef = useRef(null);
  const mode = MODES[modeIdx];

  // ── Clear interval on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  useEffect(() => {
    let mounted = true;

    const loadTasks = async () => {
      try {
        const data = await tasksApi.getTasks();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.tasks || [];
        const titles = list.map((t) => t.title).filter(Boolean);
        setTasks(titles);
        setCurrentTask(prev => (prev || titles[0] || ''));
      } catch (error) {
        console.log(error);
        if (mounted) setTasks([]);
      }
    };

    loadTasks();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSessionStats = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        setSessionsToday(parsed.sessionsToday ?? 0);
        setTotalFocusSecs(parsed.totalFocusSecs ?? 0);
      } catch (error) {
        console.log(error);
      }
    };

    loadSessionStats();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const persistSessionStats = async () => {
      try {
        await AsyncStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ sessionsToday, totalFocusSecs })
        );
      } catch (error) {
        console.log(error);
      }
    };

    persistSessionStats();
  }, [sessionsToday, totalFocusSecs]);

  // ── Tick
  const tick = useCallback(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current);
        setTimerState('idle');
        if (MODES[modeIdx].key === 'focus') {
          setSessionsToday(s => s + 1);
          setTotalFocusSecs(t => t + MODES[modeIdx].duration);
        }
        Platform.OS !== 'web' && Vibration.vibrate([0, 400, 200, 400]);
        return 0;
      }
      return prev - 1;
    });
  }, [modeIdx]);

  // ── Start / Pause / Resume
  const handleMainBtn = useCallback(() => {
    if (timerState === 'idle' || timerState === 'paused') {
      setTimerState('running');
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
      setTimerState('paused');
    }
  }, [timerState, tick]);

  // ── Reset
  const handleReset = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimerState('idle');
    setRemaining(mode.duration);
  }, [mode.duration]);

  // ── Switch mode
  const handleMode = useCallback((idx) => {
    clearInterval(intervalRef.current);
    setTimerState('idle');
    setModeIdx(idx);
    setRemaining(MODES[idx].duration);
  }, []);

  // ── Button label + icon
  const mainBtnLabel =
    timerState === 'running' ? 'Pause' :
    timerState === 'paused'  ? 'Resume' :
    mode.key === 'focus'     ? 'Start Focus' : 'Start Break';

  const mainBtnIcon =
    timerState === 'running' ? 'pause'  : 'play';

  const mainBtnColor =
    timerState === 'paused' ? '#F59E0B' : mode.color;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── 1. Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Focus</Text>
          <Text style={s.headerSub}>Stay focused and get things done</Text>
        </View>

        {/* ── 2. Mode Selector ── */}
        <View style={s.modesRow}>
          {MODES.map((m, i) => (
            <Pressable
              key={m.key}
              style={[s.modeChip, modeIdx === i && { backgroundColor: m.color, borderColor: m.color }]}
              onPress={() => handleMode(i)}
            >
              <Text style={[s.modeChipText, modeIdx === i && s.modeChipTextActive]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── 3. Timer Ring ── */}
        <View style={s.timerSection}>
          <TimerRing
            remaining={remaining}
            total={mode.duration}
            color={mode.color}
            state={timerState}
          />
        </View>

        {/* ── 4. Session Controls ── */}
        <View style={s.controls}>
          <Pressable
            style={({ pressed }) => [
              s.mainBtn,
              { backgroundColor: mainBtnColor },
              pressed && s.mainBtnPressed,
            ]}
            onPress={handleMainBtn}
          >
            <Ionicons name={mainBtnIcon} size={20} color="#fff" />
            <Text style={s.mainBtnText}>{mainBtnLabel}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.resetBtn, pressed && s.resetBtnPressed]}
            onPress={handleReset}
            hitSlop={8}
          >
            <Ionicons name="refresh" size={20} color="#6B7280" />
          </Pressable>
        </View>

        {/* ── 5. Current Task ── */}
        <Pressable
          style={({ pressed }) => [s.taskCard, pressed && s.taskCardPressed]}
          onPress={() => setPickerVisible(true)}
        >
          <View style={[s.taskIcon, { backgroundColor: mode.bgColor }]}>
            <Ionicons name="flash-outline" size={18} color={mode.color} />
          </View>
          <View style={s.taskBody}>
            <Text style={s.taskEyebrow}>FOCUSING ON</Text>
            <Text style={s.taskTitle} numberOfLines={1}>{currentTask}</Text>
          </View>
          <View style={s.taskChangePill}>
            <Text style={[s.taskChangeText, { color: mode.color }]}>Change</Text>
          </View>
        </Pressable>

        {/* ── 6. Session Stats ── */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <View style={s.statIconWrap}>
              <Ionicons name="time-outline" size={18} color="#3B82F6" />
            </View>
            <Text style={s.statVal}>{fmtDuration(totalFocusSecs)}</Text>
            <Text style={s.statLbl}>Focus time today</Text>
          </View>
          <View style={s.statCard}>
            <View style={s.statIconWrap}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
            </View>
            <Text style={s.statVal}>{sessionsToday}</Text>
            <Text style={s.statLbl}>Sessions today</Text>
          </View>
        </View>

        {/* ── Tip Card ── */}
        <View style={[s.tipCard, { backgroundColor: mode.bgColor, borderColor: mode.color + '33' }]}>
          <Ionicons name="information-circle-outline" size={16} color={mode.color} style={{ flexShrink: 0 }} />
          <Text style={[s.tipText, { color: mode.color }]}>{mode.tip}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Task Picker ── */}
      <TaskPicker
        visible={pickerVisible}
        current={currentTask}
        onSelect={setCurrentTask}
        onClose={() => setPickerVisible(false)}
        tasks={tasks}
      />
    </SafeAreaView>
  );
}

// ─── Ring Styles ──────────────────────────────────────────────────────────────

const ring = StyleSheet.create({
  wrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignSelf: 'center',
    position: 'relative',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  time: {
    fontSize: 52,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -2,
    lineHeight: 58,
  },
  stateLbl: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
});

// ─── Task Picker Styles ───────────────────────────────────────────────────────

const tp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '70%',
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18, fontWeight: '800', color: '#111827',
    paddingHorizontal: 20, marginBottom: 4, letterSpacing: -0.3,
  },
  sub: {
    fontSize: 13, color: '#9CA3AF',
    paddingHorizontal: 20, marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  rowPressed: { backgroundColor: '#F9FAFB' },
  rowActive:  { backgroundColor: '#F0F9FF' },
  check: {
    width: 22, height: 22,
    borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  checkActive:   { backgroundColor: '#3B82F6' },
  checkInactive: { borderWidth: 2, borderColor: '#D1D5DB' },
  rowText: { fontSize: 14, fontWeight: '500', color: '#374151', flex: 1 },
  rowTextActive: { color: '#1D4ED8', fontWeight: '700' },
  cancelBtn: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 24 : 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13, color: '#9CA3AF', marginTop: 3,
  },

  // Modes
  modesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modeChipText: {
    fontSize: 11, fontWeight: '700', color: '#6B7280',
  },
  modeChipTextActive: {
    color: '#fff',
  },

  // Timer
  timerSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  mainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  mainBtnPressed: { opacity: 0.88 },
  mainBtnText: {
    fontSize: 16, fontWeight: '700', color: '#fff',
  },
  resetBtn: {
    width: 54, height: 54,
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  resetBtnPressed: { backgroundColor: '#F9FAFB' },

  // Current task
  taskCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  taskCardPressed: { backgroundColor: '#F9FAFB' },
  taskIcon: {
    width: 38, height: 38,
    borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  taskBody: { flex: 1, minWidth: 0 },
  taskEyebrow: {
    fontSize: 9, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1.2, marginBottom: 3,
  },
  taskTitle: {
    fontSize: 13, fontWeight: '700', color: '#111827',
  },
  taskChangePill: {
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  taskChangeText: { fontSize: 11, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statIconWrap: {
    marginBottom: 8,
  },
  statVal: {
    fontSize: 22, fontWeight: '800', color: '#111827',
    letterSpacing: -0.5,
  },
  statLbl: {
    fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginTop: 3,
  },

  // Tip
  tipCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    fontSize: 12, fontWeight: '500', lineHeight: 18, flex: 1,
  },
});