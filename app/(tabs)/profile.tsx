
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { storageUtils } from '@/utils/storage';
import { SelfCareReminder } from '@/types';

export default function ProfileScreen() {
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Self-Care</Text>
          <Text style={styles.subtitle}>These reminders are optional and gentle</Text>
        </View>

        <View style={styles.encouragementCard}>
          <IconSymbol
            ios_icon_name="heart.fill"
            android_material_icon_name="favorite"
            size={40}
            color={colors.primary}
          />
          <Text style={styles.encouragementTitle}>You&apos;re doing enough</Text>
          <Text style={styles.encouragementText}>
            Rest counts. Progress looks different every day. You&apos;re allowed to go slow.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gentle Reminders</Text>
          {reminders.map((reminder, index) => (
            <React.Fragment key={index}>
              <View style={styles.reminderCard}>
                <View style={styles.reminderLeft}>
                  <View style={styles.reminderIconContainer}>
                    <IconSymbol
                      ios_icon_name="bell"
                      android_material_icon_name={getReminderIcon(reminder.type)}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    {reminder.lastCompleted && (
                      <Text style={styles.reminderTime}>
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
                      style={styles.checkButton}
                      onPress={() => markReminderComplete(reminder.id)}
                    >
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={20}
                        color={colors.card}
                      />
                    </TouchableOpacity>
                  )}
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => toggleReminder(reminder.id)}
                    trackColor={{ false: colors.secondary, true: colors.primary }}
                    thumbColor={colors.card}
                  />
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This App</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              This is an energy-based planner designed for chronically ill users and busy moms.
            </Text>
            <Text style={styles.infoText}>
              There are no streaks, no pressure, and no judgment. Just gentle support for managing your day based on how you feel.
            </Text>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips for Using This App</Text>
          <View style={styles.tipCard}>
            <IconSymbol
              ios_icon_name="lightbulb"
              android_material_icon_name="lightbulb"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.tipText}>
              Start each day with a check-in to help the app suggest appropriate tasks
            </Text>
          </View>
          <View style={styles.tipCard}>
            <IconSymbol
              ios_icon_name="lightbulb"
              android_material_icon_name="lightbulb"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.tipText}>
              Tasks are organized by energy cost, not time - choose what fits your capacity
            </Text>
          </View>
          <View style={styles.tipCard}>
            <IconSymbol
              ios_icon_name="lightbulb"
              android_material_icon_name="lightbulb"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.tipText}>
              Use the weekly view to see patterns in your energy and adjust accordingly
            </Text>
          </View>
        </View>
      </ScrollView>
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
  encouragementCard: {
    backgroundColor: colors.highlight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  encouragementTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  reminderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  reminderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
