import { TextStyle } from 'react-native';

export const colors = {
  primary: '#4A90E2', // A friendly blue
  secondary: '#50E3C2', // A bright teal
  background: '#F8F8F8', // Light grey background
  surface: '#FFFFFF', // White for cards and elements
  text: '#333333', // Dark grey for main text
  textSecondary: '#666666', // Medium grey for secondary text
  border: '#EEEEEE', // Light grey border
  error: '#FF6161', // Red for errors
  success: '#000000', // Green for success
  warning: '#F5A623', // Orange for warnings
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
}; 