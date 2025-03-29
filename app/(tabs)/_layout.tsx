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
import Home from './Account';
import Settings from './settings';
import TitleHeader from '@/components/Header/TitleHeader';


const Drawer = createDrawerNavigator();

export default function Layout() {
//   const [isReady, setIsReady] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(1)).current;


// const loadResources = async () => {
//     const fonts = Font.loadAsync({ 
//       'CustomFont': require('@/assets/fonts/SpaceMono-Regular.ttf'), 
// });
// // const images = Asset.loadAsync([
// //       require('@/assets/images/splash-icon.png'),
// //       require('@/assets/images/icon.png'),
// //     ]);
//     await Promise.all([fonts]);
// };
//   useEffect(() => { 
//     loadResources().then(() => {
//         Animated.timing(fadeAnim, {
//                 toValue: 0,
//                 duration: 700,
//                 useNativeDriver: true,
//               }).start(() => {
//                 setIsReady(true); // Set isReady to true after the fade-out animation completes
//               });
//     }); 
//   }, []);
  
  // if (!isReady) { 
  //   return <LoadingIndicator />; 
  // }

  const { colorMode, themeTextStyle } = useTheme();

  
  const styles={
      headerStyle: {
        backgroundColor: colorMode === 'light' ? '#000' : '#fff',
      },
      headerTintColor: colorMode === 'light' ? '#fff' : '#000',
  }

  return (
    
    // {/* {!isReady && <LoadingIndicator opacity={fadeAnim} />}
    //   {isReady && ( */}
        //  <NavigationThemeProvider value={colorMode === 'dark' ? DarkTheme : DefaultTheme}>
            <Drawer.Navigator>
              <Drawer.Screen
                name="Chat" // This is the name of the page and must match the URL from root
                component={Home}
                options={{
                  drawerLabel: 'Chats',
                  // title: 'Chats',
                  headerTitle: () => <TitleHeader allowFontScaling={false} style={themeTextStyle} >Chats</TitleHeader>
                }}
              />
              <Drawer.Screen
                name="Settings" // This is the name of the page and must match the URL from root
                component = {Settings}
                options={{
                  drawerLabel: 'Settings',
                  headerTitle: () => <TitleHeader allowFontScaling={false} style={themeTextStyle} >Settings</TitleHeader>
                }}
              />
              
            </Drawer.Navigator>
        //  </NavigationThemeProvider>
          
  );
}

