
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
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { BatteryEnergySelector } from '@/components/BatteryEnergySelector';
import { storageUtils } from '@/utils/storage';
import { DailyCheckIn, EnergyLevel, Symptom, Mood } from '@/types';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [checkIn, setCheckIn] = useState<DailyCheckIn | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  useEffect(() => {
    loadTodayCheckIn();
  }, []);

  const loadTodayCheckIn = async () => {
    const todayCheckIn = await storageUtils.getTodayCheckIn();
    if (todayCheckIn) {
      setCheckIn(todayCheckIn);
      setSelectedEnergy(todayCheckIn.energyLevel);
      setSelectedSymptoms(todayCheckIn.symptoms);
      setSelectedMood(todayCheckIn.mood);
    }
  };

  const saveCheckIn = async () => {
    if (!selectedEnergy || !selectedMood) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newCheckIn: DailyCheckIn = {
      id: today,
      date: today,
      energyLevel: selectedEnergy,
      symptoms: selectedSymptoms,
      mood: selectedMood,
    };

    await storageUtils.saveCheckIn(newCheckIn);
    setCheckIn(newCheckIn);
  };

  const toggleSymptom = (symptom: Symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const symptoms: { symptom: Symptom; label: string }[] = [
    { symptom: 'fatigue', label: 'Fatigue' },
    { symptom: 'pain', label: 'Pain' },
    { symptom: 'brain-fog', label: 'Brain Fog' },
    { symptom: 'dizziness', label: 'Dizziness' },
    { symptom: 'anxiety', label: 'Anxiety' },
    { symptom: 'nausea', label: 'Nausea' },
    { symptom: 'sensory-sensitivity', label: 'Sensory Sensitivity' },
    { symptom: 'overwhelm', label: 'Overwhelm' },
    { symptom: 'emotional-exhaustion', label: 'Emotional Exhaustion' },
    { symptom: 'irritability', label: 'Irritability' },
  ];

  const moods: { mood: Mood; label: string; icon: string }[] = [
    { mood: 'calm', label: 'Calm', icon: 'leaf' },
    { mood: 'overwhelmed', label: 'Overwhelmed', icon: 'exclamationmark.triangle' },
    { mood: 'hopeful', label: 'Hopeful', icon: 'sun.max' },
    { mood: 'tired', label: 'Tired', icon: 'moon.zzz' },
    { mood: 'anxious', label: 'Anxious', icon: 'bolt' },
    { mood: 'content', label: 'Content', icon: 'heart' },
  ];

  const getEncouragingMessage = () => {
    if (!selectedEnergy) return "How are you feeling today?";
    
    if (selectedEnergy === 'very-low') {
      return "Rest is productive. You're doing what you need to do.";
    } else if (selectedEnergy === 'low') {
      return "Rest counts. You're doing enough today.";
    } else if (selectedEnergy === 'moderate') {
      return "Progress looks different every day.";
    } else {
      return "You're allowed to go at your own pace.";
    }
  };

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
    encouragingText: {
      fontSize: 16,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      fontStyle: 'italic',
    },
    completedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.darkHighlight : colors.highlight,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      gap: 12,
    },
    completedText: {
      fontSize: 16,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      marginBottom: 16,
    },
    symptomChip: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? colors.darkAccent : colors.accent,
    },
    symptomChipSelected: {
      backgroundColor: isDark ? colors.darkAccent : colors.accent,
      borderColor: isDark ? colors.darkAccent : colors.accent,
    },
    symptomText: {
      fontSize: 14,
      color: isDark ? colors.darkText : colors.text,
      fontWeight: '500',
    },
    symptomTextSelected: {
      color: isDark ? colors.darkBackground : colors.card,
      fontWeight: '600',
    },
    moodButton: {
      width: '30%',
      backgroundColor: isDark ? colors.darkCard : colors.card,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
      gap: 6,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    moodButtonSelected: {
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
      borderColor: isDark ? colors.darkPrimary : colors.primary,
    },
    moodLabel: {
      fontSize: 12,
      color: isDark ? colors.darkText : colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    moodLabelSelected: {
      color: isDark ? colors.darkBackground : colors.card,
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    saveButtonDisabled: {
      backgroundColor: isDark ? colors.darkSecondary : colors.secondary,
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? colors.darkBackground : colors.card,
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
          <Text style={dynamicStyles.title}>Daily Check-In</Text>
          <Text style={dynamicStyles.encouragingText}>{getEncouragingMessage()}</Text>
        </View>

        {checkIn && (
          <View style={dynamicStyles.completedBanner}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={24}
              color={isDark ? colors.darkPrimary : colors.primary}
            />
            <Text style={dynamicStyles.completedText}>Check-in completed for today</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Energy Level</Text>
          <BatteryEnergySelector
            selectedEnergy={selectedEnergy}
            onSelectEnergy={setSelectedEnergy}
          />
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Symptoms (optional)</Text>
          <View style={styles.symptomsGrid}>
            {symptoms.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.symptomChip,
                    selectedSymptoms.includes(item.symptom) && dynamicStyles.symptomChipSelected,
                  ]}
                  onPress={() => toggleSymptom(item.symptom)}
                >
                  <Text
                    style={[
                      dynamicStyles.symptomText,
                      selectedSymptoms.includes(item.symptom) && dynamicStyles.symptomTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Mood</Text>
          <View style={styles.moodsGrid}>
            {moods.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.moodButton,
                    selectedMood === item.mood && dynamicStyles.moodButtonSelected,
                  ]}
                  onPress={() => setSelectedMood(item.mood)}
                >
                  <IconSymbol
                    ios_icon_name={item.icon}
                    android_material_icon_name="sentiment_satisfied"
                    size={24}
                    color={selectedMood === item.mood 
                      ? (isDark ? colors.darkBackground : colors.card)
                      : (isDark ? colors.darkText : colors.text)
                    }
                  />
                  <Text
                    style={[
                      dynamicStyles.moodLabel,
                      selectedMood === item.mood && dynamicStyles.moodLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            dynamicStyles.saveButton,
            (!selectedEnergy || !selectedMood) && dynamicStyles.saveButtonDisabled,
          ]}
          onPress={saveCheckIn}
          disabled={!selectedEnergy || !selectedMood}
        >
          <Text style={dynamicStyles.saveButtonText}>
            {checkIn ? 'Update Check-In' : 'Save Check-In'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
