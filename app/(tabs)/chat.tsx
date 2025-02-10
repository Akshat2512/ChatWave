import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import ChatList from '@/components/ChatList';
import { Ionicons } from '@expo/vector-icons';
import { useWebSocket } from '@/context/WebsocketContext';


import LoadingIndicator from '@/components/ActivityIndicator';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { StateMngProp } from '@/store/userReducer';

import { setName, setProfileImgAction } from '@/store/userAction';


export type RootStackParamList = { "SearchUser": undefined, "FriendList": undefined, "Profile": undefined } 
export default function Chat() {

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();
  const { sendMessage, recvImage, recvNotify } = useWebSocket();
  // const [prof_pic, setProfilePic] = useState(null);
  const [online, setOnline] = useState([]);
  const [notification, setNotification] = useState(false);

  const chats = ['chat1', 'chat2', 'chat3', 'chat4', 'chat5', 'chat6'];
  const [loading, indicatorVisible] = useState(true);
  const [search, searchVisible] = useState(false);  
  const [ UName, setUName ] = useState('');
   
  // const userData = useSelector((state: StateMngProp) => state.userData);

  const {isSignedIn, userName, passWord, profileImg} = useSelector((state : StateMngProp) => state.userData);


  const dispatch = useDispatch();

  useEffect(()=>{
    if(recvImage){
      if(recvImage["profile_pic"]){
        indicatorVisible(false);
        // console.log(recvImage);
        
         if(recvImage["uname"] == userName){
          dispatch(setProfileImgAction({uri:`data:image/png;base64,${recvImage["profile_pic"]}`})) 
          dispatch(setName(recvImage["name"]))
        }
          // console.log(recvImage.profile_pic);
          // setProfilePic(recvImage["profile_pic"]);
      }
      else{
        indicatorVisible(false);
      }
    }
  }, [recvImage]);

  useEffect(()=>{
   if(recvNotify["notification"]){
    if(recvNotify["notification"] == "Update Friend Tab"){
      setNotification(true);
      console.log(recvNotify);
      sendMessage(`{"get":"search_friend"}`);
   }
  }
  }, [recvNotify]);

  useEffect(() =>{
    fetchUsernameAndSendMessage();
  }, []);


  async function fetchUsernameAndSendMessage(){
    // console.log(isSignedIn, userName, passWord, prof_pic);
    // var userName = ""
    if (userName) {
      // setUName(userame.toLowerCase());
      sendMessage(`{"get":"profile_pic", "uname":"${userName}"}`);
    }
  }
  

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
    // <ThemedView style={[styles.container, themeContainerStyle]}>
    //   {/* {chats.map((chat) => (
    //     <Link style={[styles.box]} key={chat} href={`/users/${chat}`}>
    //       <ThemedText style={[themeTextStyle]}>
    //         <img src=''/> {chat}
    //       </ThemedText>
    //     </Link>
    //   ))} */}

    // </ThemedView>
    <>
       <ChatList />
       <View style = {[styles.box]}> 
          <TouchableOpacity style={[styles.tab]} onPress={(event) => {
                        event.preventDefault();
                        setNotification(false);
                        handleFriendsTab();}}>
                       <Ionicons style={[themeTextStyle]} name="person-add-outline" size={30}  />
                       <View style={[styles.status, { backgroundColor: notification ? "rgb(203, 47, 47)" : "transparent" }]}></View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab]} onPress={(event) => {
                        event.preventDefault();
                        handleSearchTab();}}>
                                  <Ionicons style={[themeTextStyle]} name="search-outline" size={30} />
          </TouchableOpacity>
          <TouchableOpacity style={[ styles.tab]} onPress={(event) => {
                        event.preventDefault();
                        handleProfileTab();}}>
                        <Image source={ profileImg } style={styles.profileImage} /> 
                        
                        {/* <Image source={prof_pic ? {uri:`data:image/png;base64,${prof_pic}`} : require('@/assets/profiles/images/default.png')} style={styles.profileImage} />  */}
                        { loading && <View style={[{position: "absolute"}]} ><LoadingIndicator /></View>}
          </TouchableOpacity>
       </View>
   
    </>

  );
}
    // {search && (
    //       <View style={[styles.search]}>
    //         {/* <SearchUser /> */}
    //         navigation.navigate("SearchUser")
    //       </View>
    //    )}

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
    justifyContent:"center",
    borderStyle: "solid",
    padding: 12,
    flexDirection: "row"
  
  },
  tab:{
    // backgroundColor: "rgba(11, 11, 11, 0.8)",
    // flex: 1,
    // textAlign: "center",
    alignItems:"center",
    justifyContent:"center",
    // borderWidth:1,
    // padding: 15,
    flexGrow:1,
  },
  profileImage: {
    justifyContent: "center",
    alignItems:"center",
    width: 32,
    height: 32,
    borderRadius: 24,
  },
 
  search:{
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
  status:{
    position: 'absolute',
    padding:5,
    borderRadius:8,
    top: 0,
    right:"30%"
    // right:12,
    // zIndex:1,
  }
 
});

