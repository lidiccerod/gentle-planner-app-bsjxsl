
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { EnergyLevel, energyLevelLabels } from '@/types';

interface BatteryEnergySelectorProps {
  selectedEnergy: EnergyLevel | null;
  onSelectEnergy: (energy: EnergyLevel) => void;
}

export function BatteryEnergySelector({ selectedEnergy, onSelectEnergy }: BatteryEnergySelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const energyLevels: EnergyLevel[] = ['very-low', 'low', 'moderate', 'high'];

  const getBatteryColor = (level: EnergyLevel) => {
    switch (level) {
      case 'very-low': return colors.energyLow;
      case 'low': return colors.energyLow;
      case 'moderate': return colors.energyMedium;
      case 'high': return colors.energyHigh;
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 16,
      padding: 20,
      gap: 20,
    },
    batteryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    batteryOuter: {
      flex: 1,
      height: 60,
      borderWidth: 3,
      borderColor: isDark ? colors.darkTextSecondary : colors.textSecondary,
      borderRadius: 12,
      padding: 4,
      flexDirection: 'row',
      gap: 2,
      overflow: 'hidden',
    },
    batteryTip: {
      width: 12,
      height: 36,
      backgroundColor: isDark ? colors.darkTextSecondary : colors.textSecondary,
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
    },
    batterySegment: {
      flex: 1,
      height: '100%',
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    batterySegmentInactive: {
      backgroundColor: isDark ? colors.darkBackground : colors.background,
      opacity: 0.3,
    },
    labelsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    labelButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    batteryLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      textAlign: 'center',
    },
    batteryLabelSelected: {
      color: isDark ? colors.darkPrimary : colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },
    selectedText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      textAlign: 'center',
    },
    selectedDescription: {
      fontSize: 13,
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  const getDescription = (level: EnergyLevel) => {
    switch (level) {
      case 'very-low': return 'Rest/Survival';
      case 'low': return 'Admin Only';
      case 'moderate': return 'Need pacing';
      case 'high': return 'Full capacity';
    }
  };

  const getSelectedIndex = () => {
    if (!selectedEnergy) return -1;
    return energyLevels.indexOf(selectedEnergy);
  };

  const selectedIndex = getSelectedIndex();

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.batteryContainer}>
        <View style={dynamicStyles.batteryOuter}>
          {energyLevels.map((level, index) => {
            const isActive = selectedIndex >= index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  dynamicStyles.batterySegment,
                  !isActive && dynamicStyles.batterySegmentInactive,
                  isActive && { backgroundColor: getBatteryColor(level) },
                ]}
                onPress={() => onSelectEnergy(level)}
                activeOpacity={0.7}
              />
            );
          })}
        </View>
        <View style={dynamicStyles.batteryTip} />
      </View>

      <View style={dynamicStyles.labelsContainer}>
        {energyLevels.map((level, index) => {
          const isSelected = selectedEnergy === level;
          return (
            <TouchableOpacity
              key={index}
              style={dynamicStyles.labelButton}
              onPress={() => onSelectEnergy(level)}
              activeOpacity={0.7}
            >
              <Text style={[
                dynamicStyles.batteryLabel,
                isSelected && dynamicStyles.batteryLabelSelected
              ]}>
                {energyLevelLabels[level]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {selectedEnergy && (
        <View style={{ gap: 4 }}>
          <Text style={dynamicStyles.selectedText}>
            {energyLevelLabels[selectedEnergy]}
          </Text>
          <Text style={dynamicStyles.selectedDescription}>
            {getDescription(selectedEnergy)}
          </Text>
        </View>
      )}
    </View>
  );
}
