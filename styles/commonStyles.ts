
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Brighter, Calming Color Palette
export const colors = {
  // Main palette - Brighter colors
  lightCream: '#EAE7E2',         // Light cream - main background
  softBlue: '#D7E2E8',           // Soft blue - secondary backgrounds
  dustyBlue: '#B9CBD9',          // Dusty blue - accents
  softPink: '#FCC9C5',           // Soft pink - highlights
  blushPink: '#FEDDD8',          // Blush pink - secondary elements
  mintGreen: '#CFE3E2',          // Mint green - success/calm
  
  // Semantic colors for light mode
  background: '#EAE7E2',         // Light Cream
  card: '#FFFFFF',               // Pure white for cards
  text: '#4A4840',               // Darker text for contrast
  textSecondary: '#8B8680',      // Muted text
  primary: '#B9CBD9',            // Dusty Blue
  secondary: '#FEDDD8',          // Blush Pink
  accent: '#FCC9C5',             // Soft Pink
  highlight: '#D7E2E8',          // Soft Blue
  
  // Dark mode colors
  darkBackground: '#2A2926',     // Dark background
  darkCard: '#3A3835',           // Slightly lighter card
  darkText: '#EAE7E2',           // Light Cream for text
  darkTextSecondary: '#B8AEA8',  // Muted text
  darkPrimary: '#B9CBD9',        // Dusty Blue
  darkSecondary: '#FEDDD8',      // Blush Pink
  darkAccent: '#FCC9C5',         // Soft Pink
  darkHighlight: '#3A3835',      // Darker highlight
  
  // Energy level colors (using palette)
  energyLow: '#FEDDD8',          // Blush Pink - warm and gentle
  energyMedium: '#CFE3E2',       // Mint Green - neutral
  energyHigh: '#B9CBD9',         // Dusty Blue - cool and energizing
  
  // Status colors (using palette)
  success: '#CFE3E2',            // Mint Green
  warning: '#FCC9C5',            // Soft Pink
  error: '#FCC9C5',              // Soft Pink
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  textSecondary: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(74, 72, 64, 0.08)',
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
  },
});
