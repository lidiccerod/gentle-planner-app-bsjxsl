
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { storageUtils } from '@/utils/storage';
import { DailyCheckIn, Task, EnergyLevel } from '@/types';

export default function WeeklyScreen() {
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Overview</Text>
          <Text style={styles.subtitle}>Progress looks different every day</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average Energy</Text>
            <View style={[styles.energyIndicator, { backgroundColor: getEnergyColor(averageEnergy) }]}>
              <Text style={styles.statValue}>
                {averageEnergy ? averageEnergy : 'N/A'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tasks Completed</Text>
            <Text style={styles.statValue}>{totalCompleted}</Text>
          </View>
        </View>

        <View style={styles.weekContainer}>
          {weekData.map((day, index) => (
            <React.Fragment key={index}>
              <DayCard
                day={day}
                getEnergyColor={getEnergyColor}
                getCompletionRate={getCompletionRate}
              />
            </React.Fragment>
          ))}
        </View>

        <View style={styles.encouragementCard}>
          <IconSymbol
            ios_icon_name="heart.fill"
            android_material_icon_name="favorite"
            size={32}
            color={colors.primary}
          />
          <Text style={styles.encouragementText}>
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
}

function DayCard({ day, getEnergyColor, getCompletionRate }: DayCardProps) {
  const isToday = day.date === new Date().toISOString().split('T')[0];
  const completionRate = getCompletionRate(day.tasks);

  return (
    <View style={[styles.dayCard, isToday && styles.dayCardToday]}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
            {day.dayName}
          </Text>
          <Text style={styles.dayDate}>
            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        
        {day.checkIn && (
          <View style={[styles.energyDot, { backgroundColor: getEnergyColor(day.checkIn.energyLevel) }]} />
        )}
      </View>

      {day.tasks.length > 0 && (
        <View style={styles.dayStats}>
          <View style={styles.taskCount}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check_circle"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.taskCountText}>
              {day.tasks.filter(t => t.completed).length}/{day.tasks.length} tasks
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
        </View>
      )}

      {day.checkIn && day.checkIn.symptoms.length > 0 && (
        <View style={styles.symptomsContainer}>
          {day.checkIn.symptoms.slice(0, 3).map((symptom, index) => (
            <React.Fragment key={index}>
              <View style={styles.symptomTag}>
                <Text style={styles.symptomTagText}>{symptom}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      )}

      {!day.checkIn && !day.tasks.length && (
        <Text style={styles.noDataText}>No data</Text>
      )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.secondary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  energyIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  weekContainer: {
    gap: 12,
    marginBottom: 24,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCardToday: {
    borderColor: colors.primary,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  dayNameToday: {
    color: colors.primary,
  },
  dayDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  energyDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dayStats: {
    marginBottom: 8,
  },
  taskCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  taskCountText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  symptomTagText: {
    fontSize: 11,
    color: colors.text,
    textTransform: 'capitalize',
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  encouragementCard: {
    backgroundColor: colors.highlight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  encouragementText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
