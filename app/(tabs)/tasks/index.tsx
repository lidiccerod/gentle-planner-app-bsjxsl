
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
  useColorScheme,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { storageUtils } from '@/utils/storage';
import { Task, EnergyLevel, TaskPriority, TaskCategory, TaskBucket, energyLevelLabels } from '@/types';

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<EnergyLevel>('moderate');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('can-wait');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('general');
  const [newTaskBucket, setNewTaskBucket] = useState<TaskBucket>('medium-energy');
  const [todayEnergy, setTodayEnergy] = useState<EnergyLevel | null>(null);
  const [filterByEnergy, setFilterByEnergy] = useState(false);
  const [selectedBucketFilter, setSelectedBucketFilter] = useState<TaskBucket | 'all'>('all');

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

  const getBucketFromEnergy = (energy: EnergyLevel): TaskBucket => {
    switch (energy) {
      case 'very-low':
      case 'low':
        return 'admin-mode';
      case 'moderate':
        return 'medium-energy';
      case 'high':
        return 'heavy-energy';
      default:
        return 'medium-energy';
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
      bucket: newTaskBucket,
      completed: false,
      date: today,
    };

    await storageUtils.addTask(newTask);
    setTasks([...tasks, newTask]);
    
    setNewTaskTitle('');
    setNewTaskEnergy('moderate');
    setNewTaskPriority('can-wait');
    setNewTaskCategory('general');
    setNewTaskBucket('medium-energy');
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
    let filtered = tasks;

    if (filterByEnergy && todayEnergy) {
      const energyOrder: Record<EnergyLevel, number> = { 
        'very-low': 1, 
        'low': 2, 
        'moderate': 3, 
        'high': 4 
      };
      const userEnergyLevel = energyOrder[todayEnergy];

      filtered = filtered.filter(task => {
        const taskEnergyLevel = energyOrder[task.energyCost];
        return taskEnergyLevel <= userEnergyLevel;
      });
    }

    if (selectedBucketFilter !== 'all') {
      filtered = filtered.filter(task => task.bucket === selectedBucketFilter);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const mustDoTasks = filteredTasks.filter(t => t.priority === 'must-do' && !t.completed);
  const otherTasks = filteredTasks.filter(t => t.priority !== 'must-do' && !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const getEnergyColor = (energy: EnergyLevel) => {
    switch (energy) {
      case 'very-low': return colors.energyLow;
      case 'low': return colors.energyLow;
      case 'moderate': return colors.energyMedium;
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

  const getBucketLabel = (bucket: TaskBucket) => {
    switch (bucket) {
      case 'admin-mode': return 'Admin Mode';
      case 'medium-energy': return 'Medium Energy';
      case 'heavy-energy': return 'Heavy Energy';
      case 'for-others': return 'For Others';
      case 'for-my-home': return 'For My Home';
      case 'for-myself': return 'For Myself';
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

  const bucketOptions: { bucket: TaskBucket; label: string }[] = [
    { bucket: 'admin-mode', label: 'Admin Mode' },
    { bucket: 'medium-energy', label: 'Medium Energy' },
    { bucket: 'heavy-energy', label: 'Heavy Energy' },
    { bucket: 'for-others', label: 'For Others' },
    { bucket: 'for-my-home', label: 'For My Home' },
    { bucket: 'for-myself', label: 'For Myself' },
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.darkBackground : colors.background,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 8,
    },
    energyBadge: {
      backgroundColor: isDark ? colors.darkHighlight : colors.highlight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    energyBadgeText: {
      fontSize: 14,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    reminderText: {
      fontSize: 14,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      fontStyle: 'italic',
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    filterButton: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? colors.darkAccent : colors.accent,
    },
    filterButtonActive: {
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
      borderColor: isDark ? colors.darkPrimary : colors.primary,
    },
    filterButtonText: {
      fontSize: 13,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: isDark ? colors.darkBackground : colors.card,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 12,
    },
    taskCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
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
    taskTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 6,
    },
    taskTitleCompleted: {
      textDecorationLine: 'line-through',
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
    },
    energyBadgeSmall: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    priorityBadge: {
      backgroundColor: isDark ? colors.darkSecondary : colors.secondary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    bucketBadge: {
      backgroundColor: isDark ? colors.darkAccent : colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 11,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      marginTop: 8,
    },
    addButton: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
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
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? colors.darkText : colors.text,
    },
    input: {
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 20,
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 12,
    },
    optionButton: {
      flex: 1,
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    categoryButton: {
      flex: 1,
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    bucketButton: {
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 10,
    },
    optionText: {
      fontSize: 13,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    optionTextSelected: {
      color: isDark ? colors.darkBackground : colors.card,
      fontWeight: '600',
    },
    addTaskButton: {
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
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
      color: isDark ? colors.darkBackground : colors.card,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>Today&apos;s Tasks</Text>
          {todayEnergy && (
            <View style={dynamicStyles.energyBadge}>
              <Text style={dynamicStyles.energyBadgeText}>
                Your energy: {energyLevelLabels[todayEnergy]}
              </Text>
            </View>
          )}
          {!todayEnergy && (
            <Text style={dynamicStyles.reminderText}>
              Complete your daily check-in to see personalized task suggestions
            </Text>
          )}
        </View>

        {todayEnergy && (
          <View style={dynamicStyles.filterContainer}>
            <TouchableOpacity
              style={[
                dynamicStyles.filterButton,
                filterByEnergy && dynamicStyles.filterButtonActive,
              ]}
              onPress={() => setFilterByEnergy(!filterByEnergy)}
            >
              <Text
                style={[
                  dynamicStyles.filterButtonText,
                  filterByEnergy && dynamicStyles.filterButtonTextActive,
                ]}
              >
                Filter by My Energy
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={dynamicStyles.filterContainer}>
          <TouchableOpacity
            style={[
              dynamicStyles.filterButton,
              selectedBucketFilter === 'all' && dynamicStyles.filterButtonActive,
            ]}
            onPress={() => setSelectedBucketFilter('all')}
          >
            <Text
              style={[
                dynamicStyles.filterButtonText,
                selectedBucketFilter === 'all' && dynamicStyles.filterButtonTextActive,
              ]}
            >
              All Buckets
            </Text>
          </TouchableOpacity>
          {bucketOptions.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  dynamicStyles.filterButton,
                  selectedBucketFilter === item.bucket && dynamicStyles.filterButtonActive,
                ]}
                onPress={() => setSelectedBucketFilter(item.bucket)}
              >
                <Text
                  style={[
                    dynamicStyles.filterButtonText,
                    selectedBucketFilter === item.bucket && dynamicStyles.filterButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {mustDoTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Must Do</Text>
            {mustDoTasks.map((task, index) => (
              <React.Fragment key={index}>
                <TaskItem
                  task={task}
                  onToggle={toggleTaskComplete}
                  onDelete={deleteTask}
                  getEnergyColor={getEnergyColor}
                  getPriorityLabel={getPriorityLabel}
                  getBucketLabel={getBucketLabel}
                  getCategoryIcon={getCategoryIcon}
                  isDark={isDark}
                />
              </React.Fragment>
            ))}
          </View>
        )}

        {otherTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Other Tasks</Text>
            {otherTasks.map((task, index) => (
              <React.Fragment key={index}>
                <TaskItem
                  task={task}
                  onToggle={toggleTaskComplete}
                  onDelete={deleteTask}
                  getEnergyColor={getEnergyColor}
                  getPriorityLabel={getPriorityLabel}
                  getBucketLabel={getBucketLabel}
                  getCategoryIcon={getCategoryIcon}
                  isDark={isDark}
                />
              </React.Fragment>
            ))}
          </View>
        )}

        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Completed</Text>
            {completedTasks.map((task, index) => (
              <React.Fragment key={index}>
                <TaskItem
                  task={task}
                  onToggle={toggleTaskComplete}
                  onDelete={deleteTask}
                  getEnergyColor={getEnergyColor}
                  getPriorityLabel={getPriorityLabel}
                  getBucketLabel={getBucketLabel}
                  getCategoryIcon={getCategoryIcon}
                  isDark={isDark}
                />
              </React.Fragment>
            ))}
          </View>
        )}

        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check_circle_outline"
              size={64}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
            <Text style={dynamicStyles.emptyText}>No tasks match your filters</Text>
            <Text style={dynamicStyles.emptySubtext}>
              {filterByEnergy ? 'Try adjusting your filters or add a new task' : 'Add a task to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={dynamicStyles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color={isDark ? colors.darkBackground : colors.card}
        />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <ScrollView style={dynamicStyles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={isDark ? colors.darkText : colors.text}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={dynamicStyles.input}
              placeholder="Task title"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <Text style={dynamicStyles.modalLabel}>Energy Demand Level</Text>
            <View style={styles.optionsRow}>
              {(['very-low', 'low', 'moderate', 'high'] as EnergyLevel[]).map((energy, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      dynamicStyles.optionButton,
                      newTaskEnergy === energy && { backgroundColor: getEnergyColor(energy) },
                    ]}
                    onPress={() => {
                      setNewTaskEnergy(energy);
                      setNewTaskBucket(getBucketFromEnergy(energy));
                    }}
                  >
                    <Text
                      style={[
                        dynamicStyles.optionText,
                        newTaskEnergy === energy && dynamicStyles.optionTextSelected,
                      ]}
                    >
                      {energyLevelLabels[energy]}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <Text style={dynamicStyles.modalLabel}>Task Bucket (Auto-assigned)</Text>
            <View style={styles.bucketGrid}>
              {bucketOptions.map((item, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      dynamicStyles.bucketButton,
                      newTaskBucket === item.bucket && { backgroundColor: isDark ? colors.darkPrimary : colors.primary },
                    ]}
                    onPress={() => setNewTaskBucket(item.bucket)}
                  >
                    <Text
                      style={[
                        dynamicStyles.optionText,
                        newTaskBucket === item.bucket && dynamicStyles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <Text style={dynamicStyles.modalLabel}>Priority</Text>
            <View style={styles.optionsRow}>
              {(['must-do', 'can-wait', 'optional'] as TaskPriority[]).map((priority, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      dynamicStyles.optionButton,
                      newTaskPriority === priority && { backgroundColor: isDark ? colors.darkPrimary : colors.primary },
                    ]}
                    onPress={() => setNewTaskPriority(priority)}
                  >
                    <Text
                      style={[
                        dynamicStyles.optionText,
                        newTaskPriority === priority && dynamicStyles.optionTextSelected,
                      ]}
                    >
                      {getPriorityLabel(priority)}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <Text style={dynamicStyles.modalLabel}>Category</Text>
            <View style={styles.optionsRow}>
              {(['general', 'kid-related', 'work', 'self'] as TaskCategory[]).map((category, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      dynamicStyles.categoryButton,
                      newTaskCategory === category && { backgroundColor: isDark ? colors.darkAccent : colors.accent },
                    ]}
                    onPress={() => setNewTaskCategory(category)}
                  >
                    <Text
                      style={[
                        dynamicStyles.optionText,
                        newTaskCategory === category && dynamicStyles.optionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <TouchableOpacity
              style={[dynamicStyles.addTaskButton, !newTaskTitle.trim() && dynamicStyles.addTaskButtonDisabled]}
              onPress={addTask}
              disabled={!newTaskTitle.trim()}
            >
              <Text style={dynamicStyles.addTaskButtonText}>Add Task</Text>
            </TouchableOpacity>
          </ScrollView>
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
  getBucketLabel: (bucket: TaskBucket) => string;
  getCategoryIcon: (category: TaskCategory) => string;
  isDark: boolean;
}

function TaskItem({ task, onToggle, onDelete, getEnergyColor, getPriorityLabel, getBucketLabel, getCategoryIcon, isDark }: TaskItemProps) {
  const dynamicStyles = StyleSheet.create({
    taskCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
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
    taskTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 6,
    },
    taskTitleCompleted: {
      textDecorationLine: 'line-through',
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
    },
    energyBadgeSmall: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    priorityBadge: {
      backgroundColor: isDark ? colors.darkSecondary : colors.secondary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    bucketBadge: {
      backgroundColor: isDark ? colors.darkAccent : colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 11,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
  });

  return (
    <View style={[dynamicStyles.taskCard, task.completed && dynamicStyles.taskCardCompleted]}>
      <TouchableOpacity
        style={styles.taskCheckbox}
        onPress={() => onToggle(task.id)}
      >
        <IconSymbol
          ios_icon_name={task.completed ? "checkmark.circle.fill" : "circle"}
          android_material_icon_name={task.completed ? "check_circle" : "radio_button_unchecked"}
          size={28}
          color={task.completed ? (isDark ? colors.darkPrimary : colors.primary) : (isDark ? colors.darkTextSecondary : colors.textSecondary)}
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[dynamicStyles.taskTitle, task.completed && dynamicStyles.taskTitleCompleted]}>
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          <View style={[dynamicStyles.energyBadgeSmall, { backgroundColor: getEnergyColor(task.energyCost) }]}>
            <Text style={dynamicStyles.badgeText}>{energyLevelLabels[task.energyCost]}</Text>
          </View>
          <View style={dynamicStyles.priorityBadge}>
            <Text style={dynamicStyles.badgeText}>{getPriorityLabel(task.priority)}</Text>
          </View>
          <View style={dynamicStyles.bucketBadge}>
            <Text style={dynamicStyles.badgeText}>{getBucketLabel(task.bucket)}</Text>
          </View>
          <IconSymbol
            ios_icon_name="tag"
            android_material_icon_name={getCategoryIcon(task.category)}
            size={16}
            color={isDark ? colors.darkTextSecondary : colors.textSecondary}
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
          color={isDark ? colors.darkTextSecondary : colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  section: {
    marginBottom: 24,
  },
  taskCheckbox: {
    padding: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  bucketGrid: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
});
