
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  useColorScheme,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { DateDisplay } from '@/components/DateDisplay';
import { storageUtils } from '@/utils/storage';
import { SelfCareReminder } from '@/types';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [reminders, setReminders] = useState<SelfCareReminder[]>([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const loadedReminders = await storageUtils.getReminders();
    setReminders(loadedReminders);
  };

  const toggleReminder = async (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      await storageUtils.updateReminder(reminderId, { enabled: !reminder.enabled });
      setReminders(reminders.map(r =>
        r.id === reminderId ? { ...r, enabled: !r.enabled } : r
      ));
    }
  };

  const markReminderComplete = async (reminderId: string) => {
    const now = new Date().toISOString();
    await storageUtils.updateReminder(reminderId, { lastCompleted: now });
    setReminders(reminders.map(r =>
      r.id === reminderId ? { ...r, lastCompleted: now } : r
    ));
  };

  const getReminderIcon = (type: SelfCareReminder['type']) => {
    switch (type) {
      case 'hydration': return 'water_drop';
      case 'medication': return 'medication';
      case 'rest': return 'bedtime';
      case 'breathing': return 'air';
    }
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
    encouragementCard: {
      backgroundColor: isDark ? colors.darkHighlight : colors.highlight,
      borderRadius: 14,
      padding: 20,
      alignItems: 'center',
      marginBottom: 28,
    },
    encouragementTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? colors.darkText : colors.text,
      marginTop: 10,
      marginBottom: 6,
    },
    encouragementText: {
      fontSize: 14,
      color: isDark ? colors.darkText : colors.text,
      textAlign: 'center',
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 14,
    },
    reminderCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reminderIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? colors.darkHighlight : colors.highlight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reminderTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 2,
    },
    reminderTime: {
      fontSize: 11,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
    },
    checkButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 12,
      padding: 16,
      gap: 10,
    },
    infoText: {
      fontSize: 13,
      color: isDark ? colors.darkText : colors.text,
      lineHeight: 19,
    },
    tipCard: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      color: isDark ? colors.darkText : colors.text,
      lineHeight: 18,
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
              <Text style={dynamicStyles.title}>Self-Care</Text>
            </View>
            <DateDisplay />
          </View>
          <Text style={dynamicStyles.subtitle}>These reminders are optional and gentle</Text>
        </View>

        <View style={dynamicStyles.encouragementCard}>
          <IconSymbol
            ios_icon_name="heart.fill"
            android_material_icon_name="favorite"
            size={36}
            color={isDark ? colors.darkPrimary : colors.primary}
          />
          <Text style={dynamicStyles.encouragementTitle}>You&apos;re doing enough</Text>
          <Text style={dynamicStyles.encouragementText}>
            Rest counts. Progress looks different every day. You&apos;re allowed to go slow.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Gentle Reminders</Text>
          {reminders.map((reminder, index) => (
            <React.Fragment key={index}>
              <View style={dynamicStyles.reminderCard}>
                <View style={styles.reminderLeft}>
                  <View style={dynamicStyles.reminderIconContainer}>
                    <IconSymbol
                      ios_icon_name="bell"
                      android_material_icon_name={getReminderIcon(reminder.type)}
                      size={22}
                      color={isDark ? colors.darkPrimary : colors.primary}
                    />
                  </View>
                  <View style={styles.reminderInfo}>
                    <Text style={dynamicStyles.reminderTitle}>{reminder.title}</Text>
                    {reminder.lastCompleted && (
                      <Text style={dynamicStyles.reminderTime}>
                        Last: {new Date(reminder.lastCompleted).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.reminderRight}>
                  {reminder.enabled && (
                    <TouchableOpacity
                      style={dynamicStyles.checkButton}
                      onPress={() => markReminderComplete(reminder.id)}
                    >
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={18}
                        color={isDark ? colors.darkBackground : colors.card}
                      />
                    </TouchableOpacity>
                  )}
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => toggleReminder(reminder.id)}
                    trackColor={{ false: isDark ? colors.darkSecondary : colors.secondary, true: isDark ? colors.darkPrimary : colors.primary }}
                    thumbColor={isDark ? colors.darkCard : colors.card}
                  />
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>About This App</Text>
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoText}>
              This is an energy-based planner designed for chronically ill users and busy moms.
            </Text>
            <Text style={dynamicStyles.infoText}>
              There are no streaks, no pressure, and no judgment. Just gentle support for managing your day based on how you feel.
            </Text>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={dynamicStyles.sectionTitle}>Tips for Using This App</Text>
          <View style={dynamicStyles.tipCard}>
            <IconSymbol
              ios_icon_name="lightbulb"
              android_material_icon_name="lightbulb"
              size={20}
              color={isDark ? colors.darkPrimary : colors.primary}
            />
            <Text style={dynamicStyles.tipText}>
              Start each day with a check-in to help the app suggest appropriate tasks
            </Text>
          </View>
          <View style={dynamicStyles.tipCard}>
            <IconSymbol
              ios_icon_name="lightbulb"
              android_material_icon_name="lightbulb"
              size={20}
              color={isDark ? colors.darkPrimary : colors.primary}
            />
            <Text style={dynamicStyles.tipText}>
              Tasks are organized by energy cost, not time - choose what fits your capacity
            </Text>
          </View>
          <View style={dynamicStyles.tipCard}>
            <IconSymbol
              ios_icon_name="lightbulb"
              android_material_icon_name="lightbulb"
              size={20}
              color={isDark ? colors.darkPrimary : colors.primary}
            />
            <Text style={dynamicStyles.tipText}>
              Use the weekly view to see patterns in your energy and adjust accordingly
            </Text>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipsSection: {
    marginBottom: 28,
  },
});
