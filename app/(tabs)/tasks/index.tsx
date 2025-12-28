
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { DateDisplay } from '@/components/DateDisplay';
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
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [todayEnergy, setTodayEnergy] = useState<EnergyLevel | null>(null);
  const [filterByEnergy, setFilterByEnergy] = useState(false);
  const [selectedBucketFilter, setSelectedBucketFilter] = useState<TaskBucket | 'all'>('all');
  const [allCategories, setAllCategories] = useState<TaskCategory[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadTasks();
    loadTodayEnergy();
    loadCategories();
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

  const loadCategories = async () => {
    const categories = await storageUtils.getAllCategories();
    console.log('Loaded categories:', categories);
    setAllCategories(categories);
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
      dueDate: newTaskDueDate ? newTaskDueDate.toISOString().split('T')[0] : undefined,
    };

    await storageUtils.addTask(newTask);
    setTasks([...tasks, newTask]);
    
    setNewTaskTitle('');
    setNewTaskEnergy('moderate');
    setNewTaskPriority('can-wait');
    setNewTaskCategory('general');
    setNewTaskBucket('medium-energy');
    setNewTaskDueDate(undefined);
    setShowAddModal(false);
  };

  const addCustomCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const trimmedCategory = newCategoryName.trim();
    console.log('Adding custom category:', trimmedCategory);
    
    await storageUtils.addCustomCategory(trimmedCategory);
    await loadCategories();
    
    setNewTaskCategory(trimmedCategory);
    setNewCategoryName('');
    setShowAddCategory(false);
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

  const bucketOptions: { bucket: TaskBucket; label: string }[] = [
    { bucket: 'admin-mode', label: 'Admin Mode' },
    { bucket: 'medium-energy', label: 'Medium Energy' },
    { bucket: 'heavy-energy', label: 'Heavy Energy' },
    { bucket: 'for-others', label: 'For Others' },
    { bucket: 'just-for-fun', label: 'Just for Fun' },
    { bucket: 'for-myself', label: 'For Myself' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.darkBackground : colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 6,
    },
    energyBadge: {
      backgroundColor: isDark ? colors.darkHighlight : colors.highlight,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      alignSelf: 'flex-start',
      marginBottom: 6,
    },
    energyBadgeText: {
      fontSize: 12,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    reminderText: {
      fontSize: 12,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      fontStyle: 'italic',
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
      flexWrap: 'wrap',
    },
    filterButton: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.darkAccent : colors.accent,
    },
    filterButtonActive: {
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
      borderColor: isDark ? colors.darkPrimary : colors.primary,
    },
    filterButtonText: {
      fontSize: 11,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: isDark ? colors.darkBackground : colors.card,
      fontWeight: '600',
    },
    bucketGridContainer: {
      marginBottom: 14,
    },
    bucketGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    bucketGridButton: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.darkAccent : colors.accent,
      width: '31%',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    bucketGridButtonActive: {
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
      borderColor: isDark ? colors.darkPrimary : colors.primary,
    },
    bucketGridButtonText: {
      fontSize: 11,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    bucketGridButtonTextActive: {
      color: isDark ? colors.darkBackground : colors.card,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 10,
    },
    taskCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    taskCardCompleted: {
      opacity: 0.6,
    },
    taskTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 5,
    },
    taskTitleCompleted: {
      textDecorationLine: 'line-through',
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
    },
    energyBadgeSmall: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 7,
    },
    badgeText: {
      fontSize: 10,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    emptyText: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginTop: 14,
    },
    emptySubtext: {
      fontSize: 12,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      marginTop: 6,
    },
    addButton: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
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
      padding: 20,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? colors.darkText : colors.text,
    },
    input: {
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 16,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 10,
    },
    optionButton: {
      flex: 1,
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      minWidth: 70,
    },
    categoryButton: {
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 6,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    optionText: {
      fontSize: 11,
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
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    addTaskButtonDisabled: {
      opacity: 0.5,
    },
    addTaskButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? colors.darkBackground : colors.card,
    },
    dueDateButton: {
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      padding: 14,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    dueDateText: {
      fontSize: 14,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
    },
    dueDatePlaceholder: {
      fontSize: 14,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
    },
    dueDateBadge: {
      backgroundColor: isDark ? colors.darkSecondary : colors.secondary,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 7,
      marginLeft: 6,
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
          <View style={dynamicStyles.headerRow}>
            <View style={dynamicStyles.titleContainer}>
              <Text style={dynamicStyles.title}>Today&apos;s Tasks</Text>
            </View>
            <DateDisplay />
          </View>
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

        <View style={dynamicStyles.bucketGridContainer}>
          <View style={dynamicStyles.bucketGrid}>
            <TouchableOpacity
              style={[
                dynamicStyles.bucketGridButton,
                selectedBucketFilter === 'all' && dynamicStyles.bucketGridButtonActive,
              ]}
              onPress={() => setSelectedBucketFilter('all')}
            >
              <Text
                style={[
                  dynamicStyles.bucketGridButtonText,
                  selectedBucketFilter === 'all' && dynamicStyles.bucketGridButtonTextActive,
                ]}
              >
                All Buckets
              </Text>
            </TouchableOpacity>
            {bucketOptions.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.bucketGridButton,
                    selectedBucketFilter === item.bucket && dynamicStyles.bucketGridButtonActive,
                  ]}
                  onPress={() => setSelectedBucketFilter(item.bucket)}
                >
                  <Text
                    style={[
                      dynamicStyles.bucketGridButtonText,
                      selectedBucketFilter === item.bucket && dynamicStyles.bucketGridButtonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
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
                  formatDate={formatDate}
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
                  formatDate={formatDate}
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
                  formatDate={formatDate}
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
              size={56}
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
          size={26}
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
                  size={22}
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

            <Text style={dynamicStyles.modalLabel}>Priority & Due Date</Text>
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

            <TouchableOpacity
              style={dynamicStyles.dueDateButton}
              onPress={() => setShowDatePicker(true)}
            >
              {newTaskDueDate ? (
                <Text style={dynamicStyles.dueDateText}>
                  Due: {formatDate(newTaskDueDate.toISOString().split('T')[0])}
                </Text>
              ) : (
                <Text style={dynamicStyles.dueDatePlaceholder}>
                  Set due date (optional)
                </Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {newTaskDueDate && (
                  <TouchableOpacity
                    onPress={() => setNewTaskDueDate(undefined)}
                    style={{ marginRight: 10 }}
                  >
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={18}
                      color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar_today"
                  size={18}
                  color={isDark ? colors.darkText : colors.text}
                />
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newTaskDueDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setNewTaskDueDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <Text style={dynamicStyles.modalLabel}>Category</Text>
            <ScrollView style={styles.categoryScroll} nestedScrollEnabled>
              {allCategories.map((category, index) => (
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
              <TouchableOpacity
                style={[dynamicStyles.categoryButton, { borderWidth: 1, borderColor: isDark ? colors.darkPrimary : colors.primary, borderStyle: 'dashed' }]}
                onPress={() => setShowAddCategory(true)}
              >
                <IconSymbol
                  ios_icon_name="plus.circle"
                  android_material_icon_name="add_circle_outline"
                  size={18}
                  color={isDark ? colors.darkPrimary : colors.primary}
                />
                <Text style={[dynamicStyles.optionText, { color: isDark ? colors.darkPrimary : colors.primary }]}>
                  Add Custom Category
                </Text>
              </TouchableOpacity>
            </ScrollView>

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

      <Modal
        visible={showAddCategory}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={[dynamicStyles.modalContent, { maxHeight: '40%' }]}>
            <View style={styles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Add Category</Text>
              <TouchableOpacity onPress={() => {
                setShowAddCategory(false);
                setNewCategoryName('');
              }}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={22}
                  color={isDark ? colors.darkText : colors.text}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={dynamicStyles.input}
              placeholder="Category name"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />

            <TouchableOpacity
              style={[dynamicStyles.addTaskButton, !newCategoryName.trim() && dynamicStyles.addTaskButtonDisabled]}
              onPress={addCustomCategory}
              disabled={!newCategoryName.trim()}
            >
              <Text style={dynamicStyles.addTaskButtonText}>Add Category</Text>
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
  formatDate: (date: string) => string;
  isDark: boolean;
}

function TaskItem({ task, onToggle, onDelete, getEnergyColor, getPriorityLabel, formatDate, isDark }: TaskItemProps) {
  const dynamicStyles = StyleSheet.create({
    taskCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    taskCardCompleted: {
      opacity: 0.6,
    },
    taskTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 5,
    },
    taskTitleCompleted: {
      textDecorationLine: 'line-through',
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
    },
    energyBadgeSmall: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 7,
    },
    badgeText: {
      fontSize: 10,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    dueDateBadge: {
      backgroundColor: isDark ? colors.darkSecondary : colors.secondary,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 7,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
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
          size={26}
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
          {task.dueDate && (
            <View style={dynamicStyles.dueDateBadge}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar_today"
                size={10}
                color={isDark ? colors.darkText : colors.text}
              />
              <Text style={dynamicStyles.badgeText}>{formatDate(task.dueDate)}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <IconSymbol
          ios_icon_name="trash"
          android_material_icon_name="delete"
          size={18}
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
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
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
    gap: 6,
    flexWrap: 'wrap',
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryScroll: {
    maxHeight: 180,
    marginBottom: 16,
  },
});
