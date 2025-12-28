
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
import { DateDisplay } from '@/components/DateDisplay';
import { storageUtils } from '@/utils/storage';
import { DailyCheckIn, Task, EnergyLevel } from '@/types';

export default function WeeklyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [weekData, setWeekData] = useState<{
    date: string;
    dayName: string;
    checkIn: DailyCheckIn | null;
    tasks: Task[];
  }[]>([]);

  useEffect(() => {
    loadWeekData();
  }, []);

  const loadWeekData = async () => {
    const today = new Date();
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const checkIns = await storageUtils.getCheckIns();
      const checkIn = checkIns.find(c => c.date === dateString) || null;
      
      const tasks = await storageUtils.getTasksForDate(dateString);
      
      weekDates.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        checkIn,
        tasks,
      });
    }

    setWeekData(weekDates);
  };

  const getEnergyColor = (energy: EnergyLevel | null) => {
    if (!energy) return colors.textSecondary;
    switch (energy) {
      case 'low': return colors.energyLow;
      case 'medium': return colors.energyMedium;
      case 'high': return colors.energyHigh;
    }
  };

  const getCompletionRate = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getAverageEnergy = () => {
    const energyValues = weekData
      .filter(d => d.checkIn)
      .map(d => {
        switch (d.checkIn?.energyLevel) {
          case 'low': return 1;
          case 'medium': return 2;
          case 'high': return 3;
          default: return 0;
        }
      });

    if (energyValues.length === 0) return null;
    
    const avg = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
    if (avg <= 1.5) return 'low';
    if (avg <= 2.5) return 'medium';
    return 'high';
  };

  const getTotalTasksCompleted = () => {
    return weekData.reduce((total, day) => {
      return total + day.tasks.filter(t => t.completed).length;
    }, 0);
  };

  const averageEnergy = getAverageEnergy();
  const totalCompleted = getTotalTasksCompleted();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.darkBackground : colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 3,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 3,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      fontStyle: 'italic',
    },
    statsCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      height: 36,
      backgroundColor: isDark ? colors.darkSecondary : colors.secondary,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      marginBottom: 6,
      textAlign: 'center',
    },
    statValue: {
      fontSize: 17,
      fontWeight: '700',
      color: isDark ? colors.darkText : colors.text,
      textTransform: 'capitalize',
    },
    energyIndicator: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 10,
    },
    encouragementCard: {
      backgroundColor: isDark ? colors.darkHighlight : colors.highlight,
      borderRadius: 14,
      padding: 20,
      alignItems: 'center',
      gap: 10,
    },
    encouragementText: {
      fontSize: 14,
      color: isDark ? colors.darkText : colors.text,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 20,
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
              <Text style={dynamicStyles.title}>Weekly Overview</Text>
            </View>
            <DateDisplay />
          </View>
          <Text style={dynamicStyles.subtitle}>Progress looks different every day</Text>
        </View>

        <View style={dynamicStyles.statsCard}>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statLabel}>Average Energy</Text>
            <View style={[dynamicStyles.energyIndicator, { backgroundColor: getEnergyColor(averageEnergy) }]}>
              <Text style={dynamicStyles.statValue}>
                {averageEnergy ? averageEnergy : 'N/A'}
              </Text>
            </View>
          </View>
          
          <View style={dynamicStyles.statDivider} />
          
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statLabel}>Tasks Completed</Text>
            <Text style={dynamicStyles.statValue}>{totalCompleted}</Text>
          </View>
        </View>

        <View style={styles.weekContainer}>
          {weekData.map((day, index) => (
            <React.Fragment key={index}>
              <DayCard
                day={day}
                getEnergyColor={getEnergyColor}
                getCompletionRate={getCompletionRate}
                isDark={isDark}
              />
            </React.Fragment>
          ))}
        </View>

        <View style={dynamicStyles.encouragementCard}>
          <IconSymbol
            ios_icon_name="heart.fill"
            android_material_icon_name="favorite"
            size={28}
            color={isDark ? colors.darkPrimary : colors.primary}
          />
          <Text style={dynamicStyles.encouragementText}>
            You&apos;re allowed to go slow. Every small step counts.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

interface DayCardProps {
  day: {
    date: string;
    dayName: string;
    checkIn: DailyCheckIn | null;
    tasks: Task[];
  };
  getEnergyColor: (energy: EnergyLevel | null) => string;
  getCompletionRate: (tasks: Task[]) => number;
  isDark: boolean;
}

function DayCard({ day, getEnergyColor, getCompletionRate, isDark }: DayCardProps) {
  const isToday = day.date === new Date().toISOString().split('T')[0];
  const completionRate = getCompletionRate(day.tasks);

  const dynamicStyles = StyleSheet.create({
    dayCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 12,
      padding: 14,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    dayCardToday: {
      borderColor: isDark ? colors.darkPrimary : colors.primary,
    },
    dayName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
    },
    dayNameToday: {
      color: isDark ? colors.darkPrimary : colors.primary,
    },
    dayDate: {
      fontSize: 12,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      marginTop: 2,
    },
    energyDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    taskCountText: {
      fontSize: 12,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
    },
    progressBar: {
      height: 5,
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      borderRadius: 2.5,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
      borderRadius: 2.5,
    },
    symptomTag: {
      backgroundColor: isDark ? colors.darkSecondary : colors.secondary,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 7,
    },
    symptomTagText: {
      fontSize: 10,
      color: isDark ? colors.darkText : colors.text,
      textTransform: 'capitalize',
    },
    noDataText: {
      fontSize: 12,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={[dynamicStyles.dayCard, isToday && dynamicStyles.dayCardToday]}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={[dynamicStyles.dayName, isToday && dynamicStyles.dayNameToday]}>
            {day.dayName}
          </Text>
          <Text style={dynamicStyles.dayDate}>
            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        
        {day.checkIn && (
          <View style={[dynamicStyles.energyDot, { backgroundColor: getEnergyColor(day.checkIn.energyLevel) }]} />
        )}
      </View>

      {day.tasks.length > 0 && (
        <View style={styles.dayStats}>
          <View style={styles.taskCount}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check_circle"
              size={14}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
            <Text style={dynamicStyles.taskCountText}>
              {day.tasks.filter(t => t.completed).length}/{day.tasks.length} tasks
            </Text>
          </View>
          
          <View style={dynamicStyles.progressBar}>
            <View style={[dynamicStyles.progressFill, { width: `${completionRate}%` }]} />
          </View>
        </View>
      )}

      {day.checkIn && day.checkIn.symptoms.length > 0 && (
        <View style={styles.symptomsContainer}>
          {day.checkIn.symptoms.slice(0, 3).map((symptom, index) => (
            <React.Fragment key={index}>
              <View style={dynamicStyles.symptomTag}>
                <Text style={dynamicStyles.symptomTagText}>{symptom}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      )}

      {!day.checkIn && !day.tasks.length && (
        <Text style={dynamicStyles.noDataText}>No data</Text>
      )}
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
  weekContainer: {
    gap: 10,
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayStats: {
    marginBottom: 6,
  },
  taskCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
});
