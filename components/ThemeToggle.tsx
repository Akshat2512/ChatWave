
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemeToggleProps {
  onToggle: () => void;
  currentMode: 'light' | 'dark';
}

export function ThemeToggle({ onToggle, currentMode }: ThemeToggleProps) {
  
  return (
    <TouchableOpacity onPress= { onToggle } style={styles.button}>
      <Ionicons 
        name={currentMode === 'dark' ? 'sunny' : 'moon'} 
        size={24} 
        color={currentMode === 'dark' ? 'white' : 'black'} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
  },
});