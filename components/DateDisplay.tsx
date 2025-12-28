
import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '@/styles/commonStyles';

export function DateDisplay() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const dynamicStyles = StyleSheet.create({
    container: {
      alignItems: 'flex-end',
    },
    dayName: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? colors.darkTextSecondary : colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    date: {
      fontSize: 13,
      fontWeight: '700',
      color: isDark ? colors.darkText : colors.text,
      marginTop: 2,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.dayName}>{dayName}</Text>
      <Text style={dynamicStyles.date}>{monthDay}</Text>
    </View>
  );
}
