
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { storageUtils } from '@/utils/storage';
import { Task, EnergyLevel, TaskPriority, TaskCategory } from '@/types';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<EnergyLevel>('medium');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('can-wait');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('general');
  const [todayEnergy, setTodayEnergy] = useState<EnergyLevel | null>(null);

  useEffect(() => {
    loadTasks();
    loadTodayEnergy();
  }, []);

  const loadTasks = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = await storageUtils.getTasksForDate(today);
    setTasks(todayTasks);
  };

  const loadTodayEnergy = async () => {
    const checkIn = await storageUtils.getTodayCheckIn();
    if (checkIn) {
      setTodayEnergy(checkIn.energyLevel);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      energyCost: newTaskEnergy,
      priority: newTaskPriority,
      category: newTaskCategory,
      completed: false,
      date: today,
    };

    await storageUtils.addTask(newTask);
    setTasks([...tasks, newTask]);
    
    setNewTaskTitle('');
    setNewTaskEnergy('medium');
    setNewTaskPriority('can-wait');
    setNewTaskCategory('general');
    setShowAddModal(false);
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await storageUtils.updateTask(taskId, { completed: !task.completed });
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    }
  };

  const deleteTask = async (taskId: string) => {
    await storageUtils.deleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const getFilteredTasks = () => {
    if (!todayEnergy) return tasks;

    const energyOrder = { low: 1, medium: 2, high: 3 };
    const userEnergyLevel = energyOrder[todayEnergy];

    return tasks.filter(task => {
      const taskEnergyLevel = energyOrder[task.energyCost];
      return taskEnergyLevel <= userEnergyLevel;
    });
  };

  const filteredTasks = getFilteredTasks();
  const mustDoTasks = filteredTasks.filter(t => t.priority === 'must-do' && !t.completed);
  const otherTasks = filteredTasks.filter(t => t.priority !== 'must-do' && !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const getEnergyColor = (energy: EnergyLevel) => {
    switch (energy) {
      case 'low': return colors.energyLow;
      case 'medium': return colors.energyMedium;
      case 'high': return colors.energyHigh;
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'must-do': return 'Must Do';
      case 'optional': return 'Optional';
      case 'can-wait': return 'Can Wait';
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'kid-related': return 'child_care';
      case 'work': return 'work';
      case 'self': return 'self_improvement';
      default: return 'task_alt';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Today&apos;s Tasks</Text>
          {todayEnergy && (
            <View style={styles.energyBadge}>
              <Text style={styles.energyBadgeText}>
                Your energy: {todayEnergy}
              </Text>
            </View>
          )}
          {!todayEnergy && (
            <Text style={styles.reminderText}>
              Complete your daily check-in to see personalized task suggestions
            </Text>
          )}
        </View>

        {mustDoTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Must Do</Text>
            {mustDoTasks.map((task, index) => (
              <React.Fragment key={index}>
                <TaskItem
                  task={task}
                  onToggle={toggleTaskComplete}
                  onDelete={deleteTask}
                  getEnergyColor={getEnergyColor}
                  getPriorityLabel={getPriorityLabel}
                  getCategoryIcon={getCategoryIcon}
                />
              </React.Fragment>
            ))}
          </View>
        )}

        {otherTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Tasks</Text>
            {otherTasks.map((task, index) => (
              <React.Fragment key={index}>
                <TaskItem
                  task={task}
                  onToggle={toggleTaskComplete}
                  onDelete={deleteTask}
                  getEnergyColor={getEnergyColor}
                  getPriorityLabel={getPriorityLabel}
                  getCategoryIcon={getCategoryIcon}
                />
              </React.Fragment>
            ))}
          </View>
        )}

        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completedTasks.map((task, index) => (
              <React.Fragment key={index}>
                <TaskItem
                  task={task}
                  onToggle={toggleTaskComplete}
                  onDelete={deleteTask}
                  getEnergyColor={getEnergyColor}
                  getPriorityLabel={getPriorityLabel}
                  getCategoryIcon={getCategoryIcon}
                />
              </React.Fragment>
            ))}
          </View>
        )}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check_circle_outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No tasks for today</Text>
            <Text style={styles.emptySubtext}>
              Add a task to get started
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color={colors.card}
        />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Task title"
              placeholderTextColor={colors.textSecondary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <Text style={styles.modalLabel}>Energy Cost</Text>
            <View style={styles.optionsRow}>
              {(['low', 'medium', 'high'] as EnergyLevel[]).map((energy, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      newTaskEnergy === energy && { backgroundColor: getEnergyColor(energy) },
                    ]}
                    onPress={() => setNewTaskEnergy(energy)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        newTaskEnergy === energy && styles.optionTextSelected,
                      ]}
                    >
                      {energy}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.optionsRow}>
              {(['must-do', 'can-wait', 'optional'] as TaskPriority[]).map((priority, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      newTaskPriority === priority && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setNewTaskPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        newTaskPriority === priority && styles.optionTextSelected,
                      ]}
                    >
                      {getPriorityLabel(priority)}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.optionsRow}>
              {(['general', 'kid-related', 'work', 'self'] as TaskCategory[]).map((category, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      newTaskCategory === category && { backgroundColor: colors.accent },
                    ]}
                    onPress={() => setNewTaskCategory(category)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        newTaskCategory === category && styles.optionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.addTaskButton, !newTaskTitle.trim() && styles.addTaskButtonDisabled]}
              onPress={addTask}
              disabled={!newTaskTitle.trim()}
            >
              <Text style={styles.addTaskButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getEnergyColor: (energy: EnergyLevel) => string;
  getPriorityLabel: (priority: TaskPriority) => string;
  getCategoryIcon: (category: TaskCategory) => string;
}

function TaskItem({ task, onToggle, onDelete, getEnergyColor, getPriorityLabel, getCategoryIcon }: TaskItemProps) {
  return (
    <View style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
      <TouchableOpacity
        style={styles.taskCheckbox}
        onPress={() => onToggle(task.id)}
      >
        <IconSymbol
          ios_icon_name={task.completed ? "checkmark.circle.fill" : "circle"}
          android_material_icon_name={task.completed ? "check_circle" : "radio_button_unchecked"}
          size={28}
          color={task.completed ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          <View style={[styles.energyBadgeSmall, { backgroundColor: getEnergyColor(task.energyCost) }]}>
            <Text style={styles.badgeText}>{task.energyCost}</Text>
          </View>
          <View style={styles.priorityBadge}>
            <Text style={styles.badgeText}>{getPriorityLabel(task.priority)}</Text>
          </View>
          <IconSymbol
            ios_icon_name="tag"
            android_material_icon_name={getCategoryIcon(task.category)}
            size={16}
            color={colors.textSecondary}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <IconSymbol
          ios_icon_name="trash"
          android_material_icon_name="delete"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  energyBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  energyBadgeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  reminderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  taskCheckbox: {
    padding: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  energyBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  categoryButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: colors.card,
    fontWeight: '600',
  },
  addTaskButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addTaskButtonDisabled: {
    opacity: 0.5,
  },
  addTaskButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
  },
});
