import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack, useLocalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, Platform, KeyboardAvoidingView } from 'react-native';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { UserProvider, useUser } from '@/context/UserContext';
import React from 'react';

import { useWebSocket, WebSocketProvider } from '@/context/WebsocketContext';
import { Provider, useSelector } from 'react-redux';

import { store } from '@/store/store';
// import * as Font from 'expo-font';

import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import Account from './(tabs)/_layout';
// import DetailsScreen from '@/users/[id]';
import Login from './index';
import Settings from './(tabs)/settings';
import NotFoundScreen from './+not-found';
import UserChats from './(tabs)/ChatView/UserChats';
import Signup from "./signup";
import SearchTab from './(tabs)/SearchTab';
import FriendTab from './(tabs)/FriendTab';
import ProfileTab from './(tabs)/ProfileTab';
import { StateMngProp } from '@/store/userReducer';
import TitleHeader from '@/components/Header/TitleHeader';
import LoadingIndicator from '@/components/favicon';
import { useFonts } from 'expo-font';

import changeNavigationBarColor from 'react-native-navigation-bar-color';

// import changeNavigationBarColor from 'react-native-navigation-bar-color'
// import { Immersive } from 'react-native-immersive';

// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });


export default function RootLayout() {

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



// const Tab = createBottomTabNavigator();

function RootLayoutNav() {

  const {isSignedIn, userName, profileDetails, } = useSelector((state:StateMngProp) => state.userData);
  console.log(isSignedIn, "user", userName, )
  const {colorMode, themeContainerStyle, themeTextStyle} = useTheme();
  const {connected} = useWebSocket();
  const Stack = createStackNavigator();
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
            GoogleSans: require('../assets/fonts/GoogleSans-Medium.ttf'),
     });
  // const [loaded] = useFonts({
  //   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  // });
  
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    changeNavigationBarColor(colorMode === 'dark' ? 'black' : 'lightgray', true);
  }, [colorMode])


  if (!loaded) {
    return null;
  }

  return (
    
    // <NavigationContainer theme={colorMode === 'dark' ? DarkTheme : DefaultTheme}>

    <NavigationThemeProvider value={colorMode === 'dark' ? DarkTheme : DefaultTheme} >  
      <View style={{ flex: 1, backgroundColor: colorMode === 'dark' ? "black" : "transparent" }}>
      <Stack.Navigator initialRouteName = { isSignedIn ? "Account" : "Login" } >
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false, }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
        <Stack.Screen name="UserChat" component={UserChats} options={{ headerShown: false }}/>
        <Stack.Screen name="SearchUser" component={SearchTab} options={
          { headerShown: true, 
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, 
            headerTitle: () => <TitleHeader allowFontScaling = {false}  style={themeTextStyle} >Search User</TitleHeader>
          }} />

        <Stack.Screen name="FriendList" component={FriendTab} options={
          { headerShown: true, 
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, 
            headerTitle: () => <TitleHeader allowFontScaling = {false}  style={themeTextStyle} >Friends</TitleHeader>
          }} />
        
        <Stack.Screen name="Profile" component={ProfileTab} options={
          { headerShown: true, 
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, 
            headerTitle: () => <TitleHeader allowFontScaling = {false}  style={themeTextStyle} >Profile</TitleHeader>
          }} />
  

        <Stack.Screen name="Not-found" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      </Stack.Navigator>
      
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      </View> 
  
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

