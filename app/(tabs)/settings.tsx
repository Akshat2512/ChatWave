import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { Collapsible } from '@/components/Collapsible';
import useStorage from '@/hooks/useStorage';
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logoutAction } from '@/store/userAction';
import { useWebSocket } from '@/context/WebsocketContext';
// import { RootStackParamList } from './chat';

export type RootStackParamList = { "Account": undefined, "Login": undefined }
export default function Settings() {
  const { colorMode, toggleColorMode, themeTextStyle, themeContainerStyle } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {socket, connected} = useWebSocket();
  
  const handleLogout = async () => {
      setTimeout(()=> {
        socket.current?.close();
        dispatch(logoutAction());
      }, 1000);
      connected.current = false;
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
       })
           
  }
  
  return (
    <><View style={[themeContainerStyle, {padding:10}]}>
    {/* <Collapsible title="Theme Settings"> */}
      <ThemedView style={[themeContainerStyle, styles.container]}>
        <ThemeToggle onToggle={toggleColorMode} currentMode={colorMode} />
        <ThemedText style={themeTextStyle}>Press the icon to toggle theme</ThemedText>
      </ThemedView>
    {/* </Collapsible> */}
    </View>
    <View style={[styles.logoutContainer, themeContainerStyle]}>
       <TouchableOpacity style={themeContainerStyle} 
        onPress={handleLogout}>
        <Text style={[styles.logoutTextStyle, themeTextStyle]}>Logout</Text>
        </TouchableOpacity>
    </View></>
  
  );
}
    //  <ThemedView style={[styles.container, themeContainerStyle]}>
    //   <ThemeToggle onToggle={toggleColorMode} currentMode={colorMode} />
    //   <ThemedText style={themeTextStyle}>Press the icon to toggle theme</ThemedText>
    // </ThemedView>
const styles = StyleSheet.create({
  container: {
    // padding:16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutContainer:{
    flex:1,
    alignItems: 'center',
    justifyContent:'flex-end',
    // zIndex: 1,
    // alignSelf:"flex-end"
  },
  logoutTextStyle:{
    textAlign:"center", 
    padding: 10,
    marginBottom: 30,
    fontSize: 20,
    borderRadius:10,
    backgroundColor: "rgba(224, 24, 14, 0.29)",

  }

});

