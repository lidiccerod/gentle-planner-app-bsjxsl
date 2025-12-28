
export type EnergyLevel = 'very-low' | 'low' | 'moderate' | 'high';

export type Symptom = 
  | 'fatigue' 
  | 'pain' 
  | 'brain-fog' 
  | 'dizziness' 
  | 'anxiety'
  | 'nausea'
  | 'sensory-sensitivity'
  | 'overwhelm'
  | 'emotional-exhaustion'
  | 'irritability';

export type Mood = 'calm' | 'overwhelmed' | 'hopeful' | 'tired' | 'anxious' | 'content';

export type TaskPriority = 'optional' | 'must-do' | 'can-wait';

export type TaskCategory = 'kid-related' | 'work' | 'self' | 'general' | string;

export type TaskBucket = 
  | 'admin-mode'      // Low Energy
  | 'medium-energy'   // Medium Energy
  | 'heavy-energy'    // Heavy Energy
  | 'for-others'      // For Others
  | 'just-for-fun'    // Just for Fun
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
  dueDate?: string;
  notes?: string;
}

export interface SelfCareReminder {
  id: string;
  type: 'hydration' | 'medication' | 'rest' | 'breathing' | 'movement';
  title: string;
  enabled: boolean;
  lastCompleted?: string;
}

export const energyLevelDescriptions: Record<EnergyLevel, string> = {
  'very-low': 'Rest/Survival',
  'low': 'Admin Only',
  'moderate': 'I can function but, need pacing',
  'high': 'I have mental and physical capacity',
};

export const energyLevelLabels: Record<EnergyLevel, string> = {
  'very-low': 'Very Low',
  'low': 'Low',
  'moderate': 'Moderate',
  'high': 'High',
};

export const defaultCategories: TaskCategory[] = ['general', 'kid-related', 'work', 'self'];
