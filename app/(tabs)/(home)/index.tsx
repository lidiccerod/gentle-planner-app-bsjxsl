
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { storageUtils } from '@/utils/storage';
import { DailyCheckIn, EnergyLevel, Symptom, Mood } from '@/types';

export default function HomeScreen() {
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

  const energyLevels: { level: EnergyLevel; label: string; icon: string }[] = [
    { level: 'low', label: 'Low Energy', icon: 'battery_1_bar' },
    { level: 'medium', label: 'Medium Energy', icon: 'battery_3_bar' },
    { level: 'high', label: 'High Energy', icon: 'battery_full' },
  ];

  const symptoms: { symptom: Symptom; label: string }[] = [
    { symptom: 'fatigue', label: 'Fatigue' },
    { symptom: 'pain', label: 'Pain' },
    { symptom: 'brain-fog', label: 'Brain Fog' },
    { symptom: 'dizziness', label: 'Dizziness' },
    { symptom: 'anxiety', label: 'Anxiety' },
  ];

  const moods: { mood: Mood; label: string; icon: string }[] = [
    { mood: 'calm', label: 'Calm', icon: 'spa' },
    { mood: 'overwhelmed', label: 'Overwhelmed', icon: 'sentiment_stressed' },
    { mood: 'hopeful', label: 'Hopeful', icon: 'sentiment_satisfied' },
    { mood: 'tired', label: 'Tired', icon: 'bedtime' },
    { mood: 'anxious', label: 'Anxious', icon: 'sentiment_dissatisfied' },
    { mood: 'content', label: 'Content', icon: 'sentiment_very_satisfied' },
  ];

  const getEncouragingMessage = () => {
    if (!selectedEnergy) return "How are you feeling today?";
    
    if (selectedEnergy === 'low') {
      return "Rest counts. You're doing enough today.";
    } else if (selectedEnergy === 'medium') {
      return "Progress looks different every day.";
    } else {
      return "You're allowed to go at your own pace.";
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
          <Text style={styles.title}>Daily Check-In</Text>
          <Text style={styles.encouragingText}>{getEncouragingMessage()}</Text>
        </View>

        {checkIn && (
          <View style={styles.completedBanner}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.completedText}>Check-in completed for today</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Level</Text>
          <View style={styles.optionsRow}>
            {energyLevels.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.energyButton,
                    selectedEnergy === item.level && styles.energyButtonSelected,
                  ]}
                  onPress={() => setSelectedEnergy(item.level)}
                >
                  <IconSymbol
                    ios_icon_name="battery.100"
                    android_material_icon_name={item.icon}
                    size={28}
                    color={selectedEnergy === item.level ? colors.card : colors.text}
                  />
                  <Text
                    style={[
                      styles.energyLabel,
                      selectedEnergy === item.level && styles.energyLabelSelected,
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
          <Text style={styles.sectionTitle}>Symptoms (optional)</Text>
          <View style={styles.symptomsGrid}>
            {symptoms.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.symptomChip,
                    selectedSymptoms.includes(item.symptom) && styles.symptomChipSelected,
                  ]}
                  onPress={() => toggleSymptom(item.symptom)}
                >
                  <Text
                    style={[
                      styles.symptomText,
                      selectedSymptoms.includes(item.symptom) && styles.symptomTextSelected,
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
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.moodsGrid}>
            {moods.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.moodButton,
                    selectedMood === item.mood && styles.moodButtonSelected,
                  ]}
                  onPress={() => setSelectedMood(item.mood)}
                >
                  <IconSymbol
                    ios_icon_name="face.smiling"
                    android_material_icon_name={item.icon}
                    size={24}
                    color={selectedMood === item.mood ? colors.card : colors.text}
                  />
                  <Text
                    style={[
                      styles.moodLabel,
                      selectedMood === item.mood && styles.moodLabelSelected,
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
            styles.saveButton,
            (!selectedEnergy || !selectedMood) && styles.saveButtonDisabled,
          ]}
          onPress={saveCheckIn}
          disabled={!selectedEnergy || !selectedMood}
        >
          <Text style={styles.saveButtonText}>
            {checkIn ? 'Update Check-In' : 'Save Check-In'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  encouragingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  completedText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
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
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  energyButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  energyButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  energyLabel: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  energyLabelSelected: {
    color: colors.card,
    fontWeight: '600',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symptomChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  symptomChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  symptomText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  symptomTextSelected: {
    color: colors.card,
    fontWeight: '600',
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    width: '30%',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  moodLabel: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: colors.card,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
  },
});
