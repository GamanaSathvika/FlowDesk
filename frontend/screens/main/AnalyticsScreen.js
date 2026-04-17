// screens/main/AnalyticsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAnalytics } from '../../api/analytics';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const RANGES = [
  { key: 'week',    label: 'This week'  },
  { key: 'month',   label: 'This month' },
  { key: 'quarter', label: 'Quarter'    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

function CardHeader({ title, badge, badgeStyle, badgeTextStyle }) {
  return (
    <View style={s.cardHead}>
      <Text style={s.cardTitle}>{title}</Text>
      {badge ? (
        <View style={[s.badge, badgeStyle]}>
          <Text style={[s.badgeText, badgeTextStyle]}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Bar Chart
function BarChart({ data, maxVal, barColor, height = 80 }) {
  const max = maxVal || Math.max(...data.map(d => d.v), 1);
  return (
    <View style={[bc.wrap, { height: height + 20 }]}>
      {data.map((d, i) => {
        const barH = Math.max(4, Math.round((d.v / max) * height));
        const color = typeof barColor === 'function' ? barColor(d, i) : barColor;
        return (
          <View key={i} style={bc.col}>
            <View style={bc.barWrap}>
              <View style={[bc.bar, { height: barH, backgroundColor: color }]} />
            </View>
            <Text style={bc.label}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Segment bar
function SegmentBar({ label, pct, color }) {
  return (
    <View style={sg.row}>
      <Text style={sg.label}>{label}</Text>
      <View style={sg.track}>
        <View style={[sg.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[sg.pct, { color }]}>{pct}%</Text>
    </View>
  );
}

// ─── Analytics Screen ─────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const [range, setRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      try {
        const data = await getAnalytics(range);
        if (!mounted) return;
        setAnalyticsData(data);
      } catch (error) {
        console.log(error);
        if (mounted) setAnalyticsData(null);
      }
    };

    loadAnalytics();
    return () => { mounted = false; };
  }, [range]);

  const d = analyticsData ?? {};

  const weeklyBarColor = useCallback((item) => {
    if (item.label === d?.bestDay) return '#3B82F6';
    if (item.v >= 7)  return '#93C5FD';
    if (item.v >= 4)  return '#BFDBFE';
    return '#DBEAFE';
  }, [d?.bestDay]);

  const focusBarColor = useCallback((item) => {
    if (item.label === d?.bestDay) return '#16A34A';
    if (item.v >= 80) return '#4ADE80';
    if (item.v >= 50) return '#86EFAC';
    return '#BBF7D0';
  }, [d?.bestDay]);

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
          <View>
            <Text style={s.headerTitle}>Analytics</Text>
            <Text style={s.headerSub}>Track your productivity</Text>
          </View>
          <Pressable style={s.iconBtn} hitSlop={8}>
            <Ionicons name="calendar-outline" size={19} color="#6B7280" />
          </Pressable>
        </View>

        {/* ── Date Range Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rangeRow}
          style={s.rangeScroll}
        >
          {RANGES.map(r => (
            <Pressable
              key={r.key}
              onPress={() => setRange(r.key)}
              style={[s.rangeChip, range === r.key && s.rangeChipActive]}
            >
              <Text style={[s.rangeChipText, range === r.key && s.rangeChipTextActive]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── 2. Summary Cards ── */}
        <View style={s.summaryRow}>
          <View style={s.sumCard}>
            <View style={[s.sumIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="checkmark-done-outline" size={15} color="#3B82F6" />
            </View>
            <Text style={s.sumVal}>{d?.summary?.tasks ?? 0}</Text>
            <Text style={s.sumLbl}>Tasks done{'\n'}today</Text>
            <Text style={[s.sumTrend, { color: '#16A34A' }]}>↑ {d?.trend?.tasks ?? ''}</Text>
          </View>

          <View style={s.sumCard}>
            <View style={[s.sumIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="time-outline" size={15} color="#16A34A" />
            </View>
            <Text style={s.sumVal}>{d?.summary?.focus ?? '0m'}</Text>
            <Text style={s.sumLbl}>Focus{'\n'}today</Text>
            <Text style={[s.sumTrend, { color: '#16A34A' }]}>{d?.trend?.focus ?? ''}</Text>
          </View>

          <View style={s.sumCard}>
            <View style={[s.sumIcon, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="star-outline" size={15} color="#D97706" />
            </View>
            <Text style={s.sumVal}>{d?.summary?.score ?? 0}%</Text>
            <Text style={s.sumLbl}>Productivity{'\n'}score</Text>
            <Text style={[s.sumTrend, { color: '#16A34A' }]}>{d?.trend?.score ?? ''}</Text>
          </View>
        </View>

        {/* ── 3. Weekly Progress Chart ── */}
        <SectionCard>
          <CardHeader
            title="Weekly Progress"
            badge="+18% vs last week"
            badgeStyle={s.badgeGreen}
            badgeTextStyle={{ color: '#16A34A' }}
          />
          <BarChart
            data={(d?.bars ?? []).map(b => ({ v: b.tasks, label: b.day }))}
            barColor={weeklyBarColor}
            height={80}
          />
          <View style={s.chartFooter}>
            <View style={s.chartStat}>
              <Text style={s.chartStatVal}>{d?.totalTasks ?? 0}</Text>
              <Text style={s.chartStatLbl}>Total tasks</Text>
            </View>
            <View style={s.chartStatDivider} />
            <View style={s.chartStat}>
              <Text style={[s.chartStatVal, { color: '#3B82F6' }]}>{d?.bestDay ?? '-'}</Text>
              <Text style={s.chartStatLbl}>Best day</Text>
            </View>
            <View style={s.chartStatDivider} />
            <View style={s.chartStat}>
              <Text style={s.chartStatVal}>{d?.avgPerDay ?? 0}</Text>
              <Text style={s.chartStatLbl}>Avg / day</Text>
            </View>
          </View>
        </SectionCard>

        {/* ── 4. Focus Time ── */}
        <SectionCard>
          <CardHeader
            title="Focus Time"
            badge={(d?.focusStats?.total ?? '0m') + ' this week'}
            badgeStyle={s.badgeBlue}
            badgeTextStyle={{ color: '#1D4ED8' }}
          />
          <View style={s.focusStatsRow}>
            <View style={s.focusStat}>
              <Text style={s.focusStatVal}>{d?.focusStats?.total ?? '0m'}</Text>
              <Text style={s.focusStatLbl}>Total</Text>
            </View>
            <View style={s.focusStatDivider} />
            <View style={s.focusStat}>
              <Text style={s.focusStatVal}>{d?.focusStats?.avg ?? '0m'}</Text>
              <Text style={s.focusStatLbl}>Avg session</Text>
            </View>
            <View style={s.focusStatDivider} />
            <View style={s.focusStat}>
              <Text style={s.focusStatVal}>{d?.focusStats?.sessions ?? 0}</Text>
              <Text style={s.focusStatLbl}>Sessions</Text>
            </View>
          </View>

          <Text style={s.sectionMicroLbl}>DAILY BREAKDOWN</Text>
          <BarChart
            data={(d?.bars ?? []).map(b => ({ v: b.focus, label: b.day }))}
            barColor={focusBarColor}
            height={52}
          />
        </SectionCard>

        {/* ── 5. Task Completion ── */}
        <SectionCard>
          <CardHeader
            title="Task Completion"
            badge={`${d?.completion?.pending ?? 0} pending`}
            badgeStyle={s.badgeAmber}
            badgeTextStyle={{ color: '#D97706' }}
          />
          <SegmentBar label="Completed"   pct={d?.completion?.completed ?? 0}   color="#3B82F6" />
          <SegmentBar label="In Progress" pct={d?.completion?.inProgress ?? 0}  color="#F59E0B" />
          <SegmentBar label="Pending"     pct={d?.completion?.pending ?? 0}     color="#D1D5DB" />

          <View style={s.legendRow}>
            {[
              { color: '#3B82F6', label: 'Completed'   },
              { color: '#F59E0B', label: 'In Progress' },
              { color: '#D1D5DB', label: 'Pending'     },
            ].map(item => (
              <View key={item.label} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: item.color }]} />
                <Text style={s.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* ── 6. Streak ── */}
        <View style={s.streakCard}>
          <View style={s.streakFlame}>
            <Ionicons name="flame" size={26} color="#F97316" />
          </View>
          <View style={s.streakBody}>
            <Text style={s.streakVal}>{d?.streakDays ?? 0}-day streak</Text>
            <Text style={s.streakLbl}>Keep going — you're on fire!</Text>
            <View style={s.streakDots}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    s.streakDot,
                    { backgroundColor: i < (d?.streakDays ?? 0) ? '#3B82F6' : '#E5E7EB' },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ── 7. Performance Insight ── */}
        <View style={s.insightCard}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#3B82F6"
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.insightEyebrow}>PERFORMANCE INSIGHT</Text>
            <Text style={s.insightText}>{d?.insight ?? ''}</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Bar Chart Styles ─────────────────────────────────────────────────────────

const bc = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  barWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 5,
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

// ─── Segment Bar Styles ───────────────────────────────────────────────────────

const sg = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    width: 80,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  pct: {
    fontSize: 11,
    fontWeight: '700',
    width: 32,
    textAlign: 'right',
  },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
  iconBtn: {
    width: 36, height: 36,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  // Range chips
  rangeScroll: { marginBottom: 14 },
  rangeRow:    { paddingHorizontal: 16, gap: 8 },
  rangeChip: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  rangeChipActive:     { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  rangeChipText:       { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  rangeChipTextActive: { color: '#fff' },

  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sumCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sumIcon: {
    width: 30, height: 30,
    borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  sumVal:   { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.5, lineHeight: 22 },
  sumLbl:   { fontSize: 10, color: '#9CA3AF', fontWeight: '600', marginTop: 3, lineHeight: 14 },
  sumTrend: { fontSize: 9, fontWeight: '700', marginTop: 5 },

  // Shared card
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },

  // Badges
  badge:       { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  badgeText:   { fontSize: 10, fontWeight: '700' },
  badgeGreen:  { backgroundColor: '#F0FDF4' },
  badgeBlue:   { backgroundColor: '#EFF6FF' },
  badgeAmber:  { backgroundColor: '#FFFBEB' },

  // Chart footer
  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chartStat: { flex: 1, alignItems: 'center' },
  chartStatVal: { fontSize: 15, fontWeight: '800', color: '#111827' },
  chartStatLbl: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  chartStatDivider: { width: 1, height: 28, backgroundColor: '#F3F4F6' },

  // Focus stats
  focusStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
  },
  focusStat: { flex: 1, alignItems: 'center', padding: 12 },
  focusStatVal: { fontSize: 15, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  focusStatLbl: { fontSize: 10, color: '#9CA3AF', marginTop: 3 },
  focusStatDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },

  sectionMicroLbl: {
    fontSize: 10, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 0.8, marginBottom: 10,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#6B7280' },

  // Streak
  streakCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  streakFlame: {
    width: 52, height: 52,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  streakBody: { flex: 1 },
  streakVal:  { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.4 },
  streakLbl:  { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  streakDots: { flexDirection: 'row', gap: 5, marginTop: 10 },
  streakDot:  { flex: 1, height: 6, borderRadius: 99 },

  // Insight
  insightCard: {
    marginHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#DBEAFE',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  insightEyebrow: {
    fontSize: 10, fontWeight: '700', color: '#1D4ED8',
    letterSpacing: 0.8, marginBottom: 5,
  },
  insightText: {
    fontSize: 12, color: '#1D4ED8',
    fontWeight: '500', lineHeight: 18,
  },
});