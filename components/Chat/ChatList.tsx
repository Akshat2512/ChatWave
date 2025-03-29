import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Image, StyleSheet, ImageSourcePropType, TouchableOpacity, StatusBar, Alert, TouchableWithoutFeedback, Button } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useUser } from '@/context/UserContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useWebSocket } from '@/context/WebsocketContext';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { friendsProp, StateMngProp } from '@/store/userReducer';
import { useRoute } from '@react-navigation/native';
import getResponse from '@/hooks/httpResponse';
import { ContactsStateProp } from '@/store/contactReducer';
import { selectChat, setFriendsList, setProfileImgAction } from '@/store/userAction';
import ImageZoomModal from '../ImageZoomModal';
import UserChat from '@/app/(tabs)/ChatView/UserChats';

// import { clearCache } from './Cache';

interface Chat{
    id: string; 
    name: string | null; 
    uname: string;
    message: string | null; 
    lastseen: string | null; 
    profileImage: {uri: string | null, updated_on: string | null};
}

export type RootStackParamList = {  "Account": undefined; "UserChat": undefined, "Login": undefined } // Define the chat route

export default function ChatList() {

  console.log("ChatList Rerendered");
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [ isImageVisible, setIsImageVisible ] = useState(false);

  const [ selectedImage, setSelectedImage ] = useState<Chat["profileImage"] | null>(null);
  
  const { sendMessage } = useWebSocket();

  var friends = useSelector((state: StateMngProp) => state.userData.friends);
  
  // const {chats} = useSelector((state: ChatStateProp) => state.chatData);

  const onlineUsers = useSelector((state: ContactsStateProp)=>state.ContactUpdates.onlineUsers)
  

  const dispatch = useDispatch();

  function showUserChat(item: Chat ) {

  const payload = {
      uname: item.uname,
      name: item.name || '',
      last_seen: item.lastseen || '' 
  }
    
  dispatch(selectChat(payload));    

  navigation.navigate('UserChat');
 
 }



function getProfileImage(uname: string, updated_on: string | null){
      sendMessage(`{"get":"profile_pic", "uname":"${uname}", "updated_on": "${updated_on}"}`);
}

function filterList(){
  return friends.filter(e => e.status == "accepted").reverse();
}

  useEffect(()=>{
    if(friends.length > 0)
      // console.log(friends)
        friends.forEach((e, index)=>{
         getProfileImage(e.uname, e.profileImage.updated_on)
      })
   }, [friends])


  
  const handleImagePress = (imageSource: Chat["profileImage"]) => {
    setSelectedImage(imageSource);
    setIsImageVisible(true);
  };

  const handleModalClose = () => {
    setIsImageVisible(false);
    setSelectedImage(null);
  };
  
  const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();
  
  const [selectedChat, setSelectedChat] = useState<friendsProp | null>(null);

  

  function showPopUp(item: friendsProp) {
    setSelectedChat(item)
  }


  function sendReqClearChat(item: friendsProp) {
    sendMessage(`{"send": "delete_messages", "uname": "${item.uname}"}`)
    setSelectedChat(null);
    
  }

  return (
    <View style={{flex: 1}}>
       { friends.length > 0 && 
        <>
        <FlatList
        data={filterList()}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
          onPress={() => {
            showUserChat(item)
          }}
          onLongPress={()=> {
            showPopUp(item)
          }}>
            <View style={[styles.chatItem, themeContainerStyle]}>
              <TouchableOpacity onPress={(event) => {
                event.preventDefault();
                handleImagePress(item.profileImage.uri ? item.profileImage : require("@/assets/profiles/images/default.png"));
              } }>
                <Image source={item.profileImage.uri ? item.profileImage : require("@/assets/profiles/images/default.png")} 
                style={styles.profileImage} />
                <View style={[styles.status, { backgroundColor: onlineUsers.includes(item.uname) ? "rgb(55, 203, 47)" : "gray" }]}>
                </View>
              </TouchableOpacity>

              <View style={styles.chatContent}>
                <Text style={[styles.nameText, themeTextStyle]} allowFontScaling={false}>{item.name} {"   "}
                  <Text style={[styles.unameText, { color: colorMode === 'dark' ? 'rgb(178, 175, 175)' : 'black' }]} allowFontScaling={false}>
                    ( {item.uname} )
                  </Text> 
                </Text>
               <Text style={styles.messageText} allowFontScaling={false}>{item.message}</Text>
             { !onlineUsers.includes(item.uname) ? <Text style={styles.timestampText} allowFontScaling={false}>{'last seen'} {item.lastseen}</Text> : <Text style={styles.timestampText}>online</Text>  } 
              </View>
            </View>
          </TouchableOpacity>

           )} />

        <ImageZoomModal 
          visible={isImageVisible} 
          onClose={handleModalClose} 
          imageSource={selectedImage || require('@/assets/profiles/images/default.png')} />
        
        {selectedChat &&  
        <TouchableWithoutFeedback onPress={()=>setSelectedChat(null)}>
          <View style={{position: "absolute", zIndex:1, justifyContent: "center", width:"100%", height:"110%", backgroundColor: "rgba(0, 0, 0, 0.38)"}}>
            <TouchableWithoutFeedback onPress={()=>{}}>
              <View style={{ borderRadius: 10, width: 300, alignSelf:"center", justifyContent:"center", backgroundColor: "gray", padding: 20}}>
                <Text style={{color: "black", padding: 10}}>This will clear all chat data between you and {selectedChat.name} ({selectedChat.uname}). Are you sure ?</Text>
                <View style={{flexDirection:"row", gap:10, alignSelf:"center"}}>
                  <Button title={"Clear"} onPress={()=>{sendReqClearChat(selectedChat)}} /><Button title={"Cancel"} color={"rgb(222, 80, 80)"} onPress={()=>setSelectedChat(null)}/>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        }
          </>

    }
      
    </View>
  );
};

const styles = StyleSheet.create({
  chatItem: { 
    flex: 1,
    flexDirection: 'row',
    // width: "100%",
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    // borderBottomColor: '#666'
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatContent: {
    flexGrow: 1,
    maxWidth: '100%'
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  unameText:{
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 12,
    color: '#666',
  },
  timestampText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 'auto'
    // justifyContent: 'flex-end',
  },
  box: { 
    borderColor: '#666', 
    borderStyle: 'solid', 
    padding: 12,
  },
  status:{
    position: 'absolute',
    padding:5,
    borderRadius:8,
    bottom: 0,
    right:12,
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    zIndex: 1,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.46)',
  
    // marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 30,
    paddingLeft:20,
    // backgroundColor: 'rgb(0, 0, 0)',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
 
});



// {selectedChat && ( 
//   <Modal animationType='slide' transparent={true} onRequestClose={() => {setSelectedChat(null); setIsChatHistoryLoaded(false)}} >
//   <GestureHandlerRootView style = {{flex:1}}>
//      {isChatHistoryLoaded && (<><StatusBar backgroundColor={themeContainerStyle.backgroundColor} barStyle="light-content" />
//         <View style={[styles.header, themeContainerStyle]}> 
//         <TouchableOpacity
//           style={styles.closeButton}
//           onPress={() => {setSelectedChat(null); setIsChatHistoryLoaded(false);}}>
//           <Ionicons name="arrow-back-outline" color={colorMode === 'dark' ? 'white' : 'black'} size={25}  />
//         </TouchableOpacity>
//         {/* <Text style={[styles.headerText, {color :  colorMode === 'dark' ? 'white' : 'black'}]}>Header Bar</Text> */}
//         <View style={[styles.chatItem]}>
//         <TouchableOpacity onPress={(event) => {
//           event.preventDefault();
//           handleImagePress(selectedChat.profileImage);}}>
//           <Image source={selectedChat.profileImage} style={styles.profileImage} /> 
//           <View style={[styles.status, { backgroundColor: online.includes(selectedChat.uname) ? "rgb(55, 203, 47)" : "gray" }]}></View>
//         </TouchableOpacity>

//           <View style={styles.chatContent}>
//               <Text style={[styles.nameText, themeTextStyle]}>{selectedChat.name}</Text>
//               <Text style={styles.messageText}>{selectedChat.uname}</Text>
//           </View>
//           <Text style={styles.timestampText}>{selectedChat.timestamp}</Text>
//       </View>
//        </View></> )}
//        <ChatView
//           uname={selectedChat.uname}
//           messages={[
//             {
//               id: '1',
//               sender: {
//                 name: 'Akshat',
//                 profileImage: require('@/assets/profiles/images/2.jpg'),
//               },
//               recipient: {
//                 name: 'You',
//                 profileImage: require('@/assets/profiles/images/1.jpg'),
//               },
//               message: 'Yes, 2pm is awesome',
//               timestamp: '11/19/19',
//             },
//           ]}
//           onLoad={handleChatHistoryLoad} />
//       </GestureHandlerRootView>
//       </Modal>)}