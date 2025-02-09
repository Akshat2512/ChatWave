import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
// import { Stack, useLocalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { UserProvider, useUser } from '@/context/UserContext';
import React from 'react';

import TitleHeader from '@/components/TitleHeader';

import { WebSocketProvider } from '@/context/WebsocketContext';
import { Provider } from 'react-redux';

import { store } from '@/store/store';


import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import Chat from './(tabs)/_layout';
// import DetailsScreen from '@/users/[id]';
import Login from './index';
import Settings from './(tabs)/settings';
import NotFoundScreen from './+not-found';
import DetailsScreen from './(tabs)/users/[id]';
import Signup from "./signup";
import SearchTab from './(tabs)/SearchTab';
import FriendTab from './(tabs)/FriendTab';
import ProfileTab from './(tabs)/ProfileTab';
// import changeNavigationBarColor from 'react-native-navigation-bar-color'
// import { Immersive } from 'react-native-immersive';

// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Convergence: require('../assets/fonts/SixtyfourConvergence-Regular-VariableFont_BLED,SCAN,XELA,YELA.ttf'),
    Flavour: require('../assets/fonts/Flavors-Regular.ttf'),
    Nosifier: require('../assets/fonts/Nosifer-Regular.ttf'),
    EaterRegular: require('../assets/fonts/Eater-Regular.ttf'),
    BonheurRoyal: require('../assets/fonts/BonheurRoyale-Regular.ttf'),
    Nabla: require('../assets/fonts/Nabla-Regular-VariableFont_EDPT,EHLT.ttf'),
    Charmonman: require('../assets/fonts/Charmonman-Regular.ttf'),
    LavishlyYours: require('../assets/fonts/LavishlyYours-Regular.ttf'),
    Neonderthaw: require('../assets/fonts/Neonderthaw-Regular.ttf'),
    PuppiesPlay: require('../assets/fonts/PuppiesPlay-Regular.ttf'),
    Nunito: require('../assets/fonts/Nunito-Italic-VariableFont_wght.ttf'),
    Oswald: require('../assets/fonts/Oswald-VariableFont_wght.ttf'),
    Roboto: require('../assets/fonts/Roboto-Italic-VariableFont_wdth,wght.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]
);

  if (!loaded) {
    return null;
  }

  return (
              <Provider store = {store}>  
              <ThemeProvider>
                <UserProvider> 
                 <WebSocketProvider>
                    <RootLayoutNav />
                 </WebSocketProvider> 
                 </UserProvider>
              </ThemeProvider>
              </Provider>
  );
}

const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

function RootLayoutNav() {
  const { colorMode } = useTheme();
  // const { token } = useUser();

  // useEffect(()=>{
  //   if(colorMode)
  //    changeNavigationBarColor(colorMode === 'light' ? "black" : "white");
  // }, [colorMode])
  
  return (
    
    <NavigationThemeProvider value={colorMode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false}} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="Account" component={Chat} options={{ headerShown: false }} />
        {/* <Stack.Screen name="UserChat" component={DetailsScreen} options={{ headerShown: true,
            // headerTitle: () => <TitleHeader Username= {Username} photoUrl={require('@/assets/profiles/images/1.jpg' )}/>
             }}/> */}
        <Stack.Screen name="SearchUser" component={SearchTab} options={
          { headerShown: true, 
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, 
            title: 'Search friends'
          }} />

        <Stack.Screen name="FriendList" component={FriendTab} options={
          { headerShown: true, 
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, 
            title: "Friend's List"
          }} />
        
        <Stack.Screen name="Profile" component={ProfileTab} options={
          { headerShown: true, 
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, 
            title: "Profile"
          }} />
  

        <Stack.Screen name="Not-found" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      </Stack.Navigator>
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

