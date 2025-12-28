
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyCheckIn, Task, SelfCareReminder, TaskCategory, defaultCategories } from '@/types';

const KEYS = {
  CHECK_INS: '@check_ins',
  TASKS: '@tasks',
  REMINDERS: '@reminders',
  CUSTOM_CATEGORIES: '@custom_categories',
};

export const storageUtils = {
  // Check-ins
  async getCheckIns(): Promise<DailyCheckIn[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CHECK_INS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error loading check-ins:', error);
      return [];
    }
  },

  async saveCheckIn(checkIn: DailyCheckIn): Promise<void> {
    try {
      const checkIns = await this.getCheckIns();
      const existingIndex = checkIns.findIndex(c => c.date === checkIn.date);
      
      if (existingIndex >= 0) {
        checkIns[existingIndex] = checkIn;
      } else {
        checkIns.push(checkIn);
      }
      
      await AsyncStorage.setItem(KEYS.CHECK_INS, JSON.stringify(checkIns));
    } catch (error) {
      console.log('Error saving check-in:', error);
    }
  },

  async getTodayCheckIn(): Promise<DailyCheckIn | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkIns = await this.getCheckIns();
      return checkIns.find(c => c.date === today) || null;
    } catch (error) {
      console.log('Error getting today check-in:', error);
      return null;
    }
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error loading tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.log('Error saving tasks:', error);
    }
  },

  async addTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      tasks.push(task);
      await this.saveTasks(tasks);
    } catch (error) {
      console.log('Error adding task:', error);
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(t => t.id === taskId);
      
      if (index >= 0) {
        tasks[index] = { ...tasks[index], ...updates };
        await this.saveTasks(tasks);
      }
    } catch (error) {
      console.log('Error updating task:', error);
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filtered = tasks.filter(t => t.id !== taskId);
      await this.saveTasks(filtered);
    } catch (error) {
      console.log('Error deleting task:', error);
    }
  },

  async getTasksForDate(date: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(t => t.date === date);
    } catch (error) {
      console.log('Error getting tasks for date:', error);
      return [];
    }
  },

  async getTasksWithDueDates(): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(t => t.dueDate);
    } catch (error) {
      console.log('Error getting tasks with due dates:', error);
      return [];
    }
  },

  async getTasksByDueDate(dueDate: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(t => t.dueDate === dueDate);
    } catch (error) {
      console.log('Error getting tasks by due date:', error);
      return [];
    }
  },

  // Self-care reminders
  async getReminders(): Promise<SelfCareReminder[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.REMINDERS);
      if (data) {
        return JSON.parse(data);
      }
      
      // Default reminders
      const defaultReminders: SelfCareReminder[] = [
        { id: '1', type: 'hydration', title: 'Drink water', enabled: true },
        { id: '2', type: 'medication', title: 'Take medication', enabled: true },
        { id: '3', type: 'rest', title: 'Rest break', enabled: true },
        { id: '4', type: 'breathing', title: 'Breathing exercise', enabled: true },
        { id: '5', type: 'movement', title: 'Gentle movement', enabled: true },
      ];
      
      await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(defaultReminders));
      return defaultReminders;
    } catch (error) {
      console.log('Error loading reminders:', error);
      return [];
    }
  },

  async updateReminder(reminderId: string, updates: Partial<SelfCareReminder>): Promise<void> {
    try {
      const reminders = await this.getReminders();
      const index = reminders.findIndex(r => r.id === reminderId);
      
      if (index >= 0) {
        reminders[index] = { ...reminders[index], ...updates };
        await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
      }
    } catch (error) {
      console.log('Error updating reminder:', error);
    }
  },

  // Custom Categories
  async getCustomCategories(): Promise<TaskCategory[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CUSTOM_CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error loading custom categories:', error);
      return [];
    }
  },

  async getAllCategories(): Promise<TaskCategory[]> {
    try {
      const customCategories = await this.getCustomCategories();
      return [...defaultCategories, ...customCategories];
    } catch (error) {
      console.log('Error loading all categories:', error);
      return defaultCategories;
    }
  },

  async addCustomCategory(category: string): Promise<void> {
    try {
      const customCategories = await this.getCustomCategories();
      const allCategories = await this.getAllCategories();
      
      // Check if category already exists
      if (!allCategories.includes(category)) {
        customCategories.push(category);
        await AsyncStorage.setItem(KEYS.CUSTOM_CATEGORIES, JSON.stringify(customCategories));
      }
    } catch (error) {
      console.log('Error adding custom category:', error);
    }
  },

  async deleteCustomCategory(category: string): Promise<void> {
    try {
      const customCategories = await this.getCustomCategories();
      const filtered = customCategories.filter(c => c !== category);
      await AsyncStorage.setItem(KEYS.CUSTOM_CATEGORIES, JSON.stringify(filtered));
    } catch (error) {
      console.log('Error deleting custom category:', error);
    }
  },
};
