import React, {useEffect, useState} from 'react';

import { Link, useLocalSearchParams } from 'expo-router';
import { View, Text, ImageSourcePropType, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import ChatHistory from '@/components/ChatHistory';



interface Chat{
  id: string; 
  name: string; 
  message: string; 
  timestamp: string; 
  profileImage: ImageSourcePropType;
}

export default function DetailsScreen() {
  const { colorMode } = useTheme();
  const themeTextStyle = colorMode === 'dark' ? Colors.darkThemeText : Colors.lightThemeText;
  const themeContainerStyle = colorMode === 'dark' ? Colors.darkContainer : Colors.lightContainer;
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  
  const { id } = useLocalSearchParams();
  
  
  return (
    // <>
      <ChatHistory
      messages={[
        {
          id: '1',
          sender: {
            name: 'Akshat',
            profileImage: require('@/assets/profiles/images/2.jpg'),
          },
          recipient: {
            name: 'You',
            profileImage: require('@/assets/profiles/images/1.jpg'),
          },
          message: 'Yes, 2pm is awesome',
          timestamp: '11/19/19',
        },
      ]} />

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: { 
    width: "95%",
    // borderWidth: 1, 
    borderColor: 'black', 
    borderStyle: 'solid', 
    padding: 12,
  },
  safeArea: { flex: 1, }, 
});
