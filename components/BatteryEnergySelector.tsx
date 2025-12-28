
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
      borderRadius: 14,
      padding: 16,
      gap: 16,
    },
    batteryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    batteryOuter: {
      flex: 1,
      height: 50,
      borderWidth: 2.5,
      borderColor: isDark ? colors.darkTextSecondary : colors.textSecondary,
      borderRadius: 10,
      padding: 3,
      flexDirection: 'row',
      gap: 2,
      overflow: 'hidden',
    },
    batteryTip: {
      width: 10,
      height: 30,
      backgroundColor: isDark ? colors.darkTextSecondary : colors.textSecondary,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
    },
    batterySegment: {
      flex: 1,
      height: '100%',
      borderRadius: 5,
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
      paddingHorizontal: 2,
    },
    labelButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 6,
    },
    batteryLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      textAlign: 'center',
    },
    batteryLabelSelected: {
      color: isDark ? colors.darkPrimary : colors.primary,
      fontWeight: '700',
      fontSize: 11,
    },
    selectedText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      textAlign: 'center',
    },
    selectedDescription: {
      fontSize: 11,
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
        <View style={{ gap: 3 }}>
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
