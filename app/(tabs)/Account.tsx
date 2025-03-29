import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, AppState, AppStateStatus, ActivityIndicator } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import ChatList from '@/components/Chat/ChatList';
import { Ionicons } from '@expo/vector-icons';
import { useWebSocket } from '@/context/WebsocketContext';


import LoadingIndicator from '@/components/ActivityIndicator';
import { NavigationProp, StackActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';

import { useDispatch, useSelector } from 'react-redux';
import { StateMngProp } from '@/store/userReducer';

export type RootStackParamList = { "SearchUser": undefined, "FriendList": undefined, "Profile": undefined, "Login": undefined }
export default function Account() {
 
  console.log("ChatTab Rerendered");

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

  const { sendMessage, socket } = useWebSocket();
  // const [prof_pic, setProfilePic] = useState(null);

  const [notification, setNotification] = useState(false);

  const [loading, indicatorVisible] = useState(true);

  const [connected, setConnected] = useState(false);
  // const { userDetails, onlineUsers } = useSelector((state: ContactsStateProp) => state.ChatUpdates);
  // var { onlineUsers } = useSelector((state: ContactsStateProp) => state.ChatUpdates)

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      console.log('Screen is focused');
      // Your on focus code here
    } else {
      console.log('Screen is unfocused');
      // Your on unfocus code here
    }
  }, [isFocused]);



  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');

        // Your on focus code here
      } else if (nextAppState.match(/inactive|background/)) {

        // console.log("Ready State: ", socket?.readyState)
        socket.current?.close();
        console.log('App has gone to the background!');
        // Your on unfocus code here
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState]);

  


  const { userName,  profileImg } = useSelector((state: StateMngProp) => state.userData);

  //   useEffect(()=>{
  //     loadCredentialsAndLogin();
  //   }, [])


  // useEffect(()=>{
  //   getuser(onlineUsers)
  // }, [onlineUsers])

  // const getuser = useCallback((onlineUsers: any)=>{
  // console.log(onlineUsers)

  // }, [])

  useEffect(() => {
   
    const start = setInterval(() => {
      sendMessage(`{"get":"online_status"}`);
      // console.log('sent')
      // console.log("send", socket.current?.readyState)

      if(socket.current?.readyState == 1)
      {
        setConnected(true)
      }
      else{
        setConnected(false)
      }

    }, 1000)

    return () => {
      if (start)
        clearInterval(start);
    }

  }, [])



useEffect(()=>{
if(connected){
  fetchUpdates();
}
}, [connected])


  function fetchUpdates() {
    // var userName = ""

    console.log(profileImg.updated_on)
    if (userName) {
      const payload_1 = `{"get":"profile_pic", "uname":"${userName}", "updated_on":"${profileImg.updated_on}" }`;
      const payload_2 = `{"get":"search_friends"}`
      
      sendMessage(payload_1);
      sendMessage(payload_2)

    }
  }


useEffect(()=>{
  if(userName )
    indicatorVisible(false);
}, [userName])



  function handleFriendsTab() {
    navigation.navigate("FriendList");
  }
  function handleSearchTab() {
    navigation.navigate("SearchUser");
  }

  function handleProfileTab() {
    navigation.navigate("Profile");
  }

  return (

    <View style={{flex: 1}}>
      { !connected && (
           <View style={{ justifyContent: "center", flexDirection: "row"}}>
            <ActivityIndicator
             size="small"
             color={colorMode === 'dark' ? 'white' : 'black'} /> 
             <Text style={themeTextStyle}>  Reconnecting ... </Text> 
            </View> ) }
      <ChatList />
      <View style={[styles.box]}>
        <TouchableOpacity style={[styles.tab]} onPress={(event) => {
          event.preventDefault();
          setNotification(false);
          handleFriendsTab();
        }}>
          <Ionicons style={[themeTextStyle]} name="person-add-outline" size={30} />
          <View style={[styles.status, { backgroundColor: notification ? "rgb(203, 47, 47)" : "transparent" }]}></View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab]} onPress={(event) => {
          event.preventDefault();
          handleSearchTab();
        }}>
          <Ionicons style={[themeTextStyle]} name="search-outline" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab]} onPress={(event) => {
          event.preventDefault();
          handleProfileTab();
        }}>
          <Image source={profileImg.uri ? profileImg : require("@/assets/profiles/images/default.png")} style={styles.profileImage} />

          {loading && <View style={[{ position: "absolute" }]} ><LoadingIndicator /></View>}
        </TouchableOpacity>

      </View>

    </View>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  box: {
    // width: "95%",
    // borderWidth: 1, 
    // borderColor: 'black', 
    justifyContent: "center",
    borderStyle: "solid",
    padding: 12,
    flexDirection: "row"

  },
  tab: {
    // backgroundColor: "rgba(11, 11, 11, 0.8)",
    // flex: 1,
    // textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth:1,
    // padding: 15,
    flexGrow: 1,
  },
  profileImage: {
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 32,
    borderRadius: 24,
  },

  search: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "rgba(232, 223, 223, 0.8)",
    padding: 10,
    borderRadius: 10,
    width: "90%",
    margin: 10,
  },
  status: {
    position: 'absolute',
    padding: 5,
    borderRadius: 8,
    top: 0,
    right: "30%"
    // right:12,
    // zIndex:1,
  }

});

