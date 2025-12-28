
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Embody Color Palette - Luxury, Peaceful, Calm
export const colors = {
  // Main palette
  morningDew: '#F0EFE6',      // Light cream/beige - backgrounds
  overcast: '#EAEAEA',         // Light gray - secondary backgrounds
  earlyDusk: '#C6C9D2',        // Muted blue-gray - accents
  tanParchment: '#DCCFC1',     // Warm tan - highlights
  almondDust: '#B8AEA8',       // Muted taupe - secondary elements
  coffeeGrounds: '#393831',    // Dark brown/charcoal - text
  
  // Semantic colors for light mode
  background: '#F0EFE6',       // Morning Dew
  card: '#FFFFFF',             // Pure white for cards
  text: '#393831',             // Coffee Grounds
  textSecondary: '#B8AEA8',    // Almond Dust
  primary: '#C6C9D2',          // Early Dusk
  secondary: '#DCCFC1',        // Tan Parchment
  accent: '#B8AEA8',           // Almond Dust
  highlight: '#EAEAEA',        // Overcast
  
  // Dark mode colors
  darkBackground: '#393831',   // Coffee Grounds
  darkCard: '#4A4840',         // Slightly lighter than Coffee Grounds
  darkText: '#F0EFE6',         // Morning Dew
  darkTextSecondary: '#B8AEA8', // Almond Dust
  darkPrimary: '#C6C9D2',      // Early Dusk
  darkSecondary: '#DCCFC1',    // Tan Parchment
  darkAccent: '#B8AEA8',       // Almond Dust
  darkHighlight: '#4A4840',    // Darker highlight
  
  // Energy level colors (using palette)
  energyLow: '#DCCFC1',        // Tan Parchment - warm and gentle
  energyMedium: '#B8AEA8',     // Almond Dust - neutral
  energyHigh: '#C6C9D2',       // Early Dusk - cool and energizing
  
  // Status colors (using palette)
  success: '#C6C9D2',          // Early Dusk
  warning: '#DCCFC1',          // Tan Parchment
  error: '#B8AEA8',            // Almond Dust
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
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
    boxShadow: '0px 2px 8px rgba(57, 56, 49, 0.08)',
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
  },
});
