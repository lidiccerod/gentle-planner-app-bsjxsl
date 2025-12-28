
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { storageUtils } from '@/utils/storage';
import { Task, EnergyLevel, energyLevelLabels } from '@/types';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasksWithDueDates, setTasksWithDueDates] = useState<Task[]>([]);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasksWithDueDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadTasksForSelectedDate(selectedDate);
    }
  }, [selectedDate, tasksWithDueDates]);

  const loadTasksWithDueDates = async () => {
    const tasks = await storageUtils.getTasksWithDueDates();
    setTasksWithDueDates(tasks);
  };

  const loadTasksForSelectedDate = async (date: string) => {
    const tasks = await storageUtils.getTasksByDueDate(date);
    setSelectedDateTasks(tasks);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getTasksForDate = (dateString: string) => {
    return tasksWithDueDates.filter(task => task.dueDate === dateString);
  };

  const formatDateString = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatSelectedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = selectedDateTasks.find(t => t.id === taskId);
    if (task) {
      await storageUtils.updateTask(taskId, { completed: !task.completed });
      await loadTasksWithDueDates();
      if (selectedDate) {
        await loadTasksForSelectedDate(selectedDate);
      }
    }
  };

  const getEnergyColor = (energy: EnergyLevel) => {
    switch (energy) {
      case 'very-low': return colors.energyLow;
      case 'low': return colors.energyLow;
      case 'moderate': return colors.energyMedium;
      case 'high': return colors.energyHigh;
    }
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const today = new Date().toISOString().split('T')[0];

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
    subtitle: {
      fontSize: 14,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      marginBottom: 24,
    },
    monthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    monthText: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
    },
    navButton: {
      padding: 8,
    },
    weekDaysRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 12,
      paddingHorizontal: 20,
    },
    weekDayText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      width: 40,
      textAlign: 'center',
    },
    calendarGrid: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    calendarRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    dayCell: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
    dayCellToday: {
      borderWidth: 2,
      borderColor: isDark ? colors.darkPrimary : colors.primary,
    },
    dayCellSelected: {
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
    },
    dayCellWithTasks: {
      backgroundColor: isDark ? colors.darkHighlight : colors.highlight,
    },
    dayText: {
      fontSize: 14,
      color: isDark ? colors.darkText : colors.text,
    },
    dayTextSelected: {
      color: isDark ? colors.darkBackground : colors.card,
      fontWeight: '600',
    },
    dayTextDisabled: {
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      opacity: 0.3,
    },
    taskIndicator: {
      position: 'absolute',
      bottom: 2,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
    },
    selectedDateSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    selectedDateTitle: {
      fontSize: 18,
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
    badgeText: {
      fontSize: 11,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  const renderCalendar = () => {
    const weeks = [];
    let days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <View key={`empty-${i}`} style={dynamicStyles.dayCell} />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(year, month, day);
      const tasksForDay = getTasksForDate(dateString);
      const isToday = dateString === today;
      const isSelected = dateString === selectedDate;
      const hasTasks = tasksForDay.length > 0;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            dynamicStyles.dayCell,
            isToday && dynamicStyles.dayCellToday,
            isSelected && dynamicStyles.dayCellSelected,
            hasTasks && !isSelected && dynamicStyles.dayCellWithTasks,
          ]}
          onPress={() => setSelectedDate(dateString)}
        >
          <Text
            style={[
              dynamicStyles.dayText,
              isSelected && dynamicStyles.dayTextSelected,
            ]}
          >
            {day}
          </Text>
          {hasTasks && !isSelected && <View style={dynamicStyles.taskIndicator} />}
        </TouchableOpacity>
      );

      // Start a new week after Saturday
      if ((startingDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <View key={`week-${weeks.length}`} style={dynamicStyles.calendarRow}>
            {days}
          </View>
        );
        days = [];
      }
    }

    return weeks;
  };

  return (
    <View style={dynamicStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>Calendar</Text>
          <Text style={dynamicStyles.subtitle}>
            View tasks with due dates
          </Text>
        </View>

        <View style={dynamicStyles.monthHeader}>
          <TouchableOpacity
            style={dynamicStyles.navButton}
            onPress={goToPreviousMonth}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={24}
              color={isDark ? colors.darkText : colors.text}
            />
          </TouchableOpacity>

          <Text style={dynamicStyles.monthText}>
            {formatMonthYear(currentDate)}
          </Text>

          <TouchableOpacity
            style={dynamicStyles.navButton}
            onPress={goToNextMonth}
          >
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={24}
              color={isDark ? colors.darkText : colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.weekDaysRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Text key={index} style={dynamicStyles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={dynamicStyles.calendarGrid}>
          {renderCalendar()}
        </View>

        {selectedDate && (
          <View style={dynamicStyles.selectedDateSection}>
            <Text style={dynamicStyles.selectedDateTitle}>
              {formatSelectedDate(selectedDate)}
            </Text>

            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map((task, index) => (
                <React.Fragment key={index}>
                  <View style={[dynamicStyles.taskCard, task.completed && dynamicStyles.taskCardCompleted]}>
                    <TouchableOpacity
                      style={styles.taskCheckbox}
                      onPress={() => toggleTaskComplete(task.id)}
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
                      </View>
                    </View>
                  </View>
                </React.Fragment>
              ))
            ) : (
              <Text style={dynamicStyles.emptyText}>
                No tasks due on this date
              </Text>
            )}
          </View>
        )}

        {!selectedDate && tasksWithDueDates.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar_today"
              size={64}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
            <Text style={dynamicStyles.emptyText}>
              No tasks with due dates yet
            </Text>
            <Text style={[dynamicStyles.emptyText, { fontSize: 14, marginTop: 8 }]}>
              Add due dates to your tasks to see them here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
});
