import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { Drawer } from 'expo-router/drawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoadingIndicator from '@/components/favicon';
import React, { useState, useEffect, useRef } from 'react';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Animated, View  } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

import { useTheme } from '@/context/ThemeContext';
import Chat from './chat';
import Settings from './settings';

const Drawer = createDrawerNavigator();

export default function Layout() {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { colorMode } = useTheme();

const loadResources = async () => {
    const fonts = Font.loadAsync({ 
      'CustomFont': require('@/assets/fonts/SpaceMono-Regular.ttf'), 
});
// const images = Asset.loadAsync([
//       require('@/assets/images/splash-icon.png'),
//       require('@/assets/images/icon.png'),
//     ]);
    await Promise.all([fonts]);
};
  useEffect(() => { 
    loadResources().then(() => {
        Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
              }).start(() => {
                setIsReady(true); // Set isReady to true after the fade-out animation completes
              });
    }); 
  }, []);
  
  // if (!isReady) { 
  //   return <LoadingIndicator />; 
  // }
  const styles={
      headerStyle: {
        backgroundColor: colorMode === 'light' ? '#000' : '#fff',
      },
      headerTintColor: colorMode === 'light' ? '#fff' : '#000',
  }

  return (
    <View style={{ flex: 1 }}>
    {!isReady && <LoadingIndicator opacity={fadeAnim} />}
      {isReady && (
         <NavigationThemeProvider value={colorMode === 'dark' ? DarkTheme : DefaultTheme}>
            <Drawer.Navigator>
              <Drawer.Screen
                name="Chat" // This is the name of the page and must match the URL from root
                component={Chat}
                options={{
                  drawerLabel: 'Chats',
                  title: 'Chats',
                }}
              />
              <Drawer.Screen
                name="Settings" // This is the name of the page and must match the URL from root
                component = {Settings}
                options={{
                  drawerLabel: 'Settings',
                  title: 'Settings',
                }}
              />

        
            </Drawer.Navigator>
            </NavigationThemeProvider>
            
          )}
    </View>
  );
}

