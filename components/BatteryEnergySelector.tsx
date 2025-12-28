
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

  const getBatteryColor = (level: EnergyLevel, isSelected: boolean) => {
    if (isSelected) {
      return isDark ? colors.darkBackground : colors.card;
    }
    switch (level) {
      case 'very-low': return colors.energyLow;
      case 'low': return colors.energyLow;
      case 'moderate': return colors.energyMedium;
      case 'high': return colors.energyHigh;
    }
  };

  const getBatteryHeight = (level: EnergyLevel) => {
    switch (level) {
      case 'very-low': return '25%';
      case 'low': return '40%';
      case 'moderate': return '65%';
      case 'high': return '90%';
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? colors.darkCard : colors.card,
      borderRadius: 16,
      padding: 20,
      gap: 16,
    },
    batteryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 140,
      gap: 12,
    },
    batteryWrapper: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
    batteryOuter: {
      width: '100%',
      height: 120,
      borderWidth: 2,
      borderColor: isDark ? colors.darkTextSecondary : colors.textSecondary,
      borderRadius: 8,
      padding: 4,
      justifyContent: 'flex-end',
      position: 'relative',
    },
    batteryOuterSelected: {
      borderColor: isDark ? colors.darkPrimary : colors.primary,
      borderWidth: 3,
    },
    batteryTip: {
      position: 'absolute',
      top: -8,
      left: '35%',
      width: '30%',
      height: 6,
      backgroundColor: isDark ? colors.darkTextSecondary : colors.textSecondary,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
    batteryTipSelected: {
      backgroundColor: isDark ? colors.darkPrimary : colors.primary,
    },
    batteryFill: {
      width: '100%',
      borderRadius: 4,
    },
    batteryLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      textAlign: 'center',
    },
    batteryLabelSelected: {
      color: isDark ? colors.darkPrimary : colors.primary,
      fontWeight: '700',
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

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.batteryContainer}>
        {energyLevels.map((level, index) => {
          const isSelected = selectedEnergy === level;
          return (
            <TouchableOpacity
              key={index}
              style={dynamicStyles.batteryWrapper}
              onPress={() => onSelectEnergy(level)}
              activeOpacity={0.7}
            >
              <View style={[
                dynamicStyles.batteryOuter,
                isSelected && dynamicStyles.batteryOuterSelected
              ]}>
                <View style={[
                  dynamicStyles.batteryTip,
                  isSelected && dynamicStyles.batteryTipSelected
                ]} />
                <View
                  style={[
                    dynamicStyles.batteryFill,
                    {
                      height: getBatteryHeight(level),
                      backgroundColor: getBatteryColor(level, isSelected),
                    },
                  ]}
                />
              </View>
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
