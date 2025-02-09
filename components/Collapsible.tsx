import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export function Collapsible({ children, title }: PropsWithChildren < { title: string } >) {
  const [isOpen, setIsOpen] = useState(false);
  // const theme = useColorScheme() ?? 'light';
  const {colorMode} = useTheme();
  const themeTextStyle = colorMode === 'dark' ? Colors.darkThemeText : Colors.lightThemeText;
  const themeContainerStyle = colorMode === 'dark' ? Colors.darkContainer : Colors.lightContainer;

  return (
    <ThemedView>
      <TouchableOpacity
        style={[styles.heading, themeContainerStyle]}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={colorMode == 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText style={themeTextStyle} type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    // marginTop: 6,
    // marginLeft: 24,
  },
});
