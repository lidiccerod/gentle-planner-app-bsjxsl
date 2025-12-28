
export type EnergyLevel = 'low' | 'medium' | 'high';

export type Symptom = 'fatigue' | 'pain' | 'brain-fog' | 'dizziness' | 'anxiety';

export type Mood = 'calm' | 'overwhelmed' | 'hopeful' | 'tired' | 'anxious' | 'content';

export type TaskPriority = 'optional' | 'must-do' | 'can-wait';

export type TaskCategory = 'kid-related' | 'work' | 'self' | 'general';

export type TaskBucket = 
  | 'admin-mode'      // Low Energy
  | 'medium-energy'   // Medium Energy
  | 'heavy-energy'    // Heavy Energy
  | 'for-others'      // For Others
  | 'for-my-home'     // For My Home
  | 'for-myself';     // For Myself

export interface DailyCheckIn {
  id: string;
  date: string;
  energyLevel: EnergyLevel;
  symptoms: Symptom[];
  mood: Mood;
}

export interface Task {
  id: string;
  title: string;
  energyCost: EnergyLevel;
  priority: TaskPriority;
  category: TaskCategory;
  bucket: TaskBucket;
  completed: boolean;
  date: string;
  notes?: string;
}

export interface SelfCareReminder {
  id: string;
  type: 'hydration' | 'medication' | 'rest' | 'breathing';
  title: string;
  enabled: boolean;
  lastCompleted?: string;
}
