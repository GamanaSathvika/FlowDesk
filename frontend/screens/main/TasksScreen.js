// screens/main/TasksScreen.js
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_TASKS = [
  { id: 1,  title: 'Update dashboard components',      sub: 'Due 3:00 PM · Design',       tag: 'High',   done: false },
  { id: 2,  title: 'Write release notes for v1.4',     sub: 'Due 5:00 PM · Writing',      tag: 'Medium', done: false },
  { id: 3,  title: 'Review pull requests',             sub: 'Due 6:00 PM · Engineering',  tag: 'Low',    done: false },
  { id: 4,  title: 'Prepare quarterly report',         sub: 'Due Tomorrow · Finance',     tag: 'High',   done: false },
  { id: 5,  title: 'Team standup prep',                sub: 'Due 9:00 AM · Meetings',     tag: 'Medium', done: false },
  { id: 6,  title: 'Design system audit',              sub: 'Due Tomorrow · Design',      tag: 'Low',    done: false },
  { id: 7,  title: 'Design system review',             sub: 'Done at 10:00 AM',           tag: 'High',   done: true  },
  { id: 8,  title: 'Sync with Priya on onboarding',   sub: 'Done at 12:30 PM',           tag: 'Medium', done: true  },
  { id: 9,  title: 'Sprint planning notes',            sub: 'Done yesterday',             tag: 'Low',    done: true  },
  { id: 10, title: 'Update Notion workspace',          sub: 'Done yesterday',             tag: 'Medium', done: true  },
];

const FILTERS = [
  { key: 'all',       label: 'All'           },
  { key: 'pending',   label: 'Pending'       },
  { key: 'completed', label: 'Completed'     },
  { key: 'high',      label: 'High Priority' },
];

const TAGS    = ['High', 'Medium', 'Low'];
const TAG_CFG = {
  High:   { bg: '#FEF2F2', text: '#DC2626' },
  Medium: { bg: '#FFFBEB', text: '#D97706' },
  Low:    { bg: '#F0FDF4', text: '#16A34A' },
};

let nextId = 11;

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function TaskModal({ visible, task, onSave, onClose }) {
  const [title, setTitle]   = useState('');
  const [sub,   setSub]     = useState('');
  const [tag,   setTag]     = useState('Medium');

  // Sync fields when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSub(task.sub);
      setTag(task.tag);
    } else {
      setTitle('');
      setSub('');
      setTag('Medium');
    }
  }, [task, visible]);

  const isEditing = Boolean(task);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), sub: sub.trim() || 'No due date', tag });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={m.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={m.kvContainer}
      >
        <View style={m.sheet}>
          {/* Handle */}
          <View style={m.handle} />

          <Text style={m.sheetTitle}>{isEditing ? 'Edit Task' : 'New Task'}</Text>

          <Text style={m.label}>Task title</Text>
          <TextInput
            style={m.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="next"
          />

          <Text style={m.label}>Due date / notes</Text>
          <TextInput
            style={m.input}
            value={sub}
            onChangeText={setSub}
            placeholder="e.g. Due 3:00 PM · Design"
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <Text style={m.label}>Priority</Text>
          <View style={m.tagRow}>
            {TAGS.map(t => {
              const cfg = TAG_CFG[t];
              const active = tag === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTag(t)}
                  style={[
                    m.tagChip,
                    { backgroundColor: active ? cfg.bg : '#F9FAFB' },
                    active && { borderColor: cfg.text },
                  ]}
                >
                  <Text style={[m.tagChipText, { color: active ? cfg.text : '#9CA3AF' }]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={m.btnRow}>
            <Pressable style={m.cancelBtn} onPress={onClose}>
              <Text style={m.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[m.saveBtn, !title.trim() && m.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={m.saveText}>{isEditing ? 'Save changes' : 'Add task'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Action Sheet (Edit / Delete) ─────────────────────────────────────────────

function ActionSheet({ visible, task, onEdit, onDelete, onClose }) {
  if (!task) return null;
  const tag = TAG_CFG[task.tag] || TAG_CFG.Medium;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={a.overlay} />
      </TouchableWithoutFeedback>
      <View style={a.sheet}>
        <View style={a.handle} />

        {/* Task preview */}
        <View style={a.preview}>
          <Text style={a.previewTitle} numberOfLines={2}>{task.title}</Text>
          <View style={[a.previewTag, { backgroundColor: tag.bg }]}>
            <Text style={[a.previewTagText, { color: tag.text }]}>{task.tag}</Text>
          </View>
        </View>

        <View style={a.divider} />

        {/* Edit */}
        <Pressable style={({ pressed }) => [a.action, pressed && a.actionPressed]} onPress={onEdit}>
          <View style={[a.actionIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="create-outline" size={18} color="#3B82F6" />
          </View>
          <View style={a.actionBody}>
            <Text style={a.actionTitle}>Edit task</Text>
            <Text style={a.actionSub}>Change title, date or priority</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </Pressable>

        {/* Mark done/undone */}
        <Pressable
          style={({ pressed }) => [a.action, pressed && a.actionPressed]}
          onPress={() => { onClose(); }}
        >
          <View style={[a.actionIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name={task.done ? 'refresh-outline' : 'checkmark-circle-outline'} size={18} color="#16A34A" />
          </View>
          <View style={a.actionBody}>
            <Text style={a.actionTitle}>{task.done ? 'Mark as pending' : 'Mark as complete'}</Text>
            <Text style={a.actionSub}>{task.done ? 'Move back to pending' : 'Move to completed'}</Text>
          </View>
        </Pressable>

        <View style={a.divider} />

        {/* Delete */}
        <Pressable style={({ pressed }) => [a.action, pressed && a.actionPressed]} onPress={onDelete}>
          <View style={[a.actionIcon, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </View>
          <View style={a.actionBody}>
            <Text style={[a.actionTitle, { color: '#DC2626' }]}>Delete task</Text>
            <Text style={a.actionSub}>This cannot be undone</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </Pressable>

        <Pressable style={a.cancelBtn} onPress={onClose}>
          <Text style={a.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

const TaskCard = React.memo(function TaskCard({ task, onToggle, onPress }) {
  const tag = TAG_CFG[task.tag] || TAG_CFG.Medium;
  return (
    <Pressable
      style={({ pressed }) => [s.taskCard, pressed && s.taskCardPressed]}
      onPress={() => onPress(task)}
    >
      {/* Checkbox — separate hit target */}
      <Pressable
        onPress={() => onToggle(task.id)}
        hitSlop={8}
        style={[s.checkbox, task.done ? s.cbDone : s.cbUndone]}
      >
        {task.done && <Ionicons name="checkmark" size={13} color="#fff" />}
      </Pressable>

      <View style={s.taskBody}>
        <Text
          style={[s.taskTitle, task.done && s.taskTitleDone]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View style={s.taskSubRow}>
          <Ionicons name="time-outline" size={11} color="#9CA3AF" />
          <Text style={s.taskSub} numberOfLines={1}>{task.sub}</Text>
        </View>
      </View>

      <View style={[s.tag, { backgroundColor: tag.bg }]}>
        <Text style={[s.tagText, { color: tag.text }]}>{task.tag}</Text>
      </View>

      <Ionicons name="ellipsis-horizontal" size={16} color="#D1D5DB" style={{ marginLeft: 4 }} />
    </Pressable>
  );
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
  return (
    <View style={s.emptyWrap}>
      <View style={s.emptyIcon}>
        <Ionicons name="clipboard-outline" size={36} color="#D1D5DB" />
      </View>
      <Text style={s.emptyTitle}>No tasks here</Text>
      <Text style={s.emptySub}>Add your first task to get started</Text>
      <Pressable style={s.emptyBtn} onPress={onAdd}>
        <Ionicons name="add" size={16} color="#3B82F6" />
        <Text style={s.emptyBtnText}>Add a task</Text>
      </Pressable>
    </View>
  );
}

// ─── Tasks Screen ─────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const [tasks,         setTasks]         = useState(INITIAL_TASKS);
  const [search,        setSearch]        = useState('');
  const [activeFilter,  setActiveFilter]  = useState('all');

  // Modal state
  const [modalVisible,  setModalVisible]  = useState(false);
  const [editingTask,   setEditingTask]   = useState(null);

  // Action sheet state
  const [sheetVisible,  setSheetVisible]  = useState(false);
  const [selectedTask,  setSelectedTask]  = useState(null);

  // ── Derived lists
  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'pending')   return !t.done;
    if (activeFilter === 'completed') return t.done;
    if (activeFilter === 'high')      return t.tag === 'High';
    return true;
  });
  const pending   = filtered.filter(t => !t.done);
  const completed = filtered.filter(t =>  t.done);
  const doneCount = tasks.filter(t => t.done).length;

  // ── Handlers
  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const openSheet = useCallback((task) => {
    setSelectedTask(task);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setTimeout(() => setSelectedTask(null), 300);
  }, []);

  const openAdd = useCallback(() => {
    setEditingTask(null);
    setModalVisible(true);
  }, []);

  const openEdit = useCallback(() => {
    closeSheet();
    setTimeout(() => {
      setEditingTask(selectedTask);
      setModalVisible(true);
    }, 350);
  }, [selectedTask, closeSheet]);

  const handleDelete = useCallback(() => {
    if (!selectedTask) return;
    setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    closeSheet();
  }, [selectedTask, closeSheet]);

  const handleSave = useCallback((data) => {
    if (editingTask) {
      setTasks(prev => prev.map(t =>
        t.id === editingTask.id ? { ...t, ...data } : t
      ));
    } else {
      setTasks(prev => [...prev, { id: nextId++, done: false, ...data }]);
    }
    setModalVisible(false);
    setEditingTask(null);
  }, [editingTask]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Tasks</Text>
          <Text style={s.headerSub}>{tasks.length} tasks · {doneCount} completed</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn} hitSlop={8}>
            <Ionicons name="options-outline" size={19} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={17} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Filter chips ── */}
      <View style={{ height: 50 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtersRow}
            style={s.filtersScroll}
          >

          {FILTERS.map(f => (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[s.chip, activeFilter === f.key ? s.chipActive : s.chipInactive]}
            >
              <Text style={[s.chipText, activeFilter === f.key ? s.chipTextActive : s.chipTextInactive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
          </ScrollView>
        </View>

      {/* ── Task List ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <>
                <Text style={s.sectionLbl}>PENDING · {pending.length}</Text>
                <View style={s.taskList}>
                  {pending.map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggle={toggleTask}
                      onPress={openSheet}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <>
                <View style={s.sep} />
                <Text style={s.sectionLbl}>COMPLETED · {completed.length}</Text>
                <View style={s.taskList}>
                  {completed.map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggle={toggleTask}
                      onPress={openSheet}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        style={({ pressed }) => [s.fab, pressed && s.fabPressed]}
        onPress={openAdd}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      {/* ── Modals ── */}
      <ActionSheet
        visible={sheetVisible}
        task={selectedTask}
        onEdit={openEdit}
        onDelete={handleDelete}
        onClose={closeSheet}
      />

      <TaskModal
        visible={modalVisible}
        task={editingTask}
        onSave={handleSave}
        onClose={() => { setModalVisible(false); setEditingTask(null); }}
      />
    </SafeAreaView>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, color: '#9CA3AF', marginTop: 2, fontWeight: '500' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  // Search
  searchWrap: { 
    paddingHorizontal: 16, 
    marginTop: 8,
    marginBottom: 16 
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: {
    flex: 1, fontSize: 14,
    color: '#111827',
    backgroundColor: 'transparent',
  },

  // Filters
  filtersScroll: { 
    marginBottom: 12,
    maxHeight: 50,   // 🔥 limits height → removes big gap
  },
  filtersRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    height: 40,   // 🔥 prevents stretching
  },
  chip: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5,
  },
  chipActive:   { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  chipInactive: { backgroundColor: '#fff',    borderColor: '#E5E7EB' },
  chipText:     { fontSize: 12, fontWeight: '700' },
  chipTextActive:   { color: '#fff' },
  chipTextInactive: { color: '#6B7280' },

  // List
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  sectionLbl: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    fontSize: 11, fontWeight: '700',
    color: '#9CA3AF', letterSpacing: 1,
  },
  taskList: { paddingHorizontal: 16, gap: 8 },
  sep: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16, marginVertical: 16 },

  // Task card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  taskCardPressed: { backgroundColor: '#F9FAFB' },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cbDone:   { backgroundColor: '#3B82F6' },
  cbUndone: { borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: '#fff' },
  taskBody: { flex: 1, minWidth: 0 },
  taskTitle:     { fontSize: 13, fontWeight: '600', color: '#111827', lineHeight: 18 },
  taskTitleDone: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  taskSubRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  taskSub:       { fontSize: 11, color: '#9CA3AF', flex: 1 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  tagText: { fontSize: 10, fontWeight: '700' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 54, height: 54,
    backgroundColor: '#3B82F6',
    borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabPressed: { backgroundColor: '#2563EB' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: {
    width: 72, height: 72,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySub:   { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '700', color: '#3B82F6' },
});

// ─── Action Sheet Styles ──────────────────────────────────────────────────────

const a = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 16,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },
  previewTitle: {
    flex: 1,
    fontSize: 15, fontWeight: '700', color: '#111827',
  },
  previewTag: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  previewTagText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 20, marginBottom: 4 },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  actionPressed: { backgroundColor: '#F9FAFB' },
  actionIcon: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  actionBody: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  actionSub:   { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  kvContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18, fontWeight: '800', color: '#111827',
    marginBottom: 20, letterSpacing: -0.3,
  },
  label: {
    fontSize: 12, fontWeight: '700',
    color: '#6B7280', letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: '#111827',
    marginBottom: 16,
  },
  tagRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  tagChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  tagChipText: { fontSize: 12, fontWeight: '700' },

  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0 },
  saveText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});