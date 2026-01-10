
import { colors } from '@/styles/commonStyles';
import { DateDisplay } from '@/components/DateDisplay';
import { SelfCareReminder } from '@/types';
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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { storageUtils } from '@/utils/storage';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [reminders, setReminders] = useState<SelfCareReminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderName, setNewReminderName] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const savedReminders = await storageUtils.getReminders();
    setReminders(savedReminders);
  };

  const toggleReminder = async (reminderId: string) => {
    const updated = reminders.map((r) =>
      r.id === reminderId ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);
    await storageUtils.saveReminders(updated);
  };

  const addReminder = async () => {
    if (!newReminderName.trim()) {
      return;
    }

    const newReminder: SelfCareReminder = {
      id: Date.now().toString(),
      type: 'custom',
      title: newReminderName.trim(),
      enabled: true,
      completed: false,
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    await storageUtils.saveReminders(updated);
    setNewReminderName('');
    setShowAddModal(false);
  };

  const deleteReminder = async (reminderId: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = reminders.filter((r) => r.id !== reminderId);
            setReminders(updated);
            await storageUtils.saveReminders(updated);
          },
        },
      ]
    );
  };

  const markReminderComplete = async (reminderId: string) => {
    const updated = reminders.map((r) =>
      r.id === reminderId ? { ...r, completed: !r.completed } : r
    );
    setReminders(updated);
    await storageUtils.saveReminders(updated);
  };

  const getReminderIcon = (type: SelfCareReminder['type']) => {
    switch (type) {
      case 'hydration':
        return { ios: 'drop.fill', android: 'water-drop' };
      case 'medication':
        return { ios: 'pills.fill', android: 'medication' };
      case 'rest':
        return { ios: 'bed.double.fill', android: 'hotel' };
      case 'breathing':
        return { ios: 'wind', android: 'air' };
      case 'movement':
        return { ios: 'figure.walk', android: 'directions-walk' };
      default:
        return { ios: 'star.fill', android: 'star' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors[isDark ? 'dark' : 'light'].background }]}>
      <DateDisplay />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, { color: colors[isDark ? 'dark' : 'light'].text }]}>
          Gentle Reminders
        </Text>
        <Text style={[styles.subtitle, { color: colors[isDark ? 'dark' : 'light'].textSecondary }]}>
          Optional self-care nudges
        </Text>

        <View style={styles.reminderGrid}>
          {reminders.map((reminder) => {
            const icon = getReminderIcon(reminder.type);
            return (
              <View
                key={reminder.id}
                style={[
                  styles.reminderCard,
                  { backgroundColor: colors[isDark ? 'dark' : 'light'].card },
                ]}
              >
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderInfo}>
                    <IconSymbol
                      ios_icon_name={icon.ios}
                      android_material_icon_name={icon.android}
                      size={20}
                      color={colors[isDark ? 'dark' : 'light'].primary}
                    />
                    <Text style={[styles.reminderLabel, { color: colors[isDark ? 'dark' : 'light'].text }]}>
                      {reminder.title}
                    </Text>
                  </View>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => toggleReminder(reminder.id)}
                    trackColor={{ false: '#767577', true: colors[isDark ? 'dark' : 'light'].primary }}
                  />
                </View>

                {reminder.enabled && (
                  <View style={styles.reminderActions}>
                    <TouchableOpacity
                      style={[
                        styles.completeButton,
                        reminder.completed && styles.completedButton,
                        { backgroundColor: reminder.completed ? colors[isDark ? 'dark' : 'light'].success : colors[isDark ? 'dark' : 'light'].cardLight },
                      ]}
                      onPress={() => markReminderComplete(reminder.id)}
                    >
                      <Text style={[styles.completeButtonText, { color: colors[isDark ? 'dark' : 'light'].text }]}>
                        {reminder.completed ? '✓ Done' : 'Mark Done'}
                      </Text>
                    </TouchableOpacity>

                    {reminder.type === 'custom' && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteReminder(reminder.id)}
                      >
                        <IconSymbol 
                          ios_icon_name="trash.fill" 
                          android_material_icon_name="delete" 
                          size={18} 
                          color={colors[isDark ? 'dark' : 'light'].error} 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors[isDark ? 'dark' : 'light'].primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <IconSymbol 
            ios_icon_name="plus" 
            android_material_icon_name="add" 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.addButtonText}>Add Custom Reminder</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors[isDark ? 'dark' : 'light'].card }]}>
            <Text style={[styles.modalTitle, { color: colors[isDark ? 'dark' : 'light'].text }]}>
              Add New Reminder
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors[isDark ? 'dark' : 'light'].cardLight,
                  color: colors[isDark ? 'dark' : 'light'].text,
                },
              ]}
              placeholder="Reminder name..."
              placeholderTextColor={colors[isDark ? 'dark' : 'light'].textSecondary}
              value={newReminderName}
              onChangeText={setNewReminderName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewReminderName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors[isDark ? 'dark' : 'light'].text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors[isDark ? 'dark' : 'light'].primary }]}
                onPress={addReminder}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  reminderGrid: {
    gap: 12,
  },
  reminderCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reminderLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  completeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedButton: {
    opacity: 0.7,
  },
  completeButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
