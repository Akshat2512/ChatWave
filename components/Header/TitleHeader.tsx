import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';



interface TitleHeaderProps { 
  allowFontScaling: boolean, 
  style: any, 
  children: string 
}

const TitleHeader: React.FC<TitleHeaderProps> = ({ allowFontScaling, style, children }) => (
                <Text
                  allowFontScaling={allowFontScaling}
                  style={[style,  { fontWeight: 'bold' }]}
                >
                 {children}
                </Text>
              )


export default TitleHeader;
