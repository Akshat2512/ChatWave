import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Image, StyleSheet, ImageSourcePropType, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import ImageZoomModal from './ImageZoomModal';
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useUser } from '@/context/UserContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useWebSocket } from '@/context/WebsocketContext';
import ChatHistory from '@/components/ChatHistory';
import { Ionicons } from '@expo/vector-icons';

interface Chat{
    id: string; 
    name: string; 
    uname: string;
    message: string; 
    timestamp: string; 
    profileImage: ImageSourcePropType;
}

export type RootStackParamList = {  "Account": undefined; "UserChat": undefined } // Define the chat route

export default function ChatList() {

  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [online, setOnline] = useState<string[]>([]);
  const [isChatHistoryLoaded, setIsChatHistoryLoaded] = useState(false);
  const [chatData, setChatData] = useState([
    {
      id: '1',
      uname: "akshat2512",
      name: 'Akshat',
      message: 'Yes, 2pm is awesome',
      timestamp: '11/19/19',
      profileImage: require('@/assets/profiles/images/1.jpg'),
    },
    {
        id: '2',
        uname: "johnconnor12",
        name: 'John Connor',
        message: 'Yes, 2pm is awesome',
        timestamp: '11/19/19',
        profileImage: require('@/assets/profiles/images/2.jpg'),
    },
    // Add more chat data objects here
  ]);
  
  const [ isImageVisible, setIsImageVisible ] = useState(false);

  const [ selectedImage, setSelectedImage ] = useState<ImageSourcePropType | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const { sendMessage, recvMessage } = useWebSocket();
  
  useEffect(()=>{

      if (recvMessage) 
      {
        if(recvMessage["online_status"]){
          setOnline(recvMessage["online_status"]);
        }
      }
  }, [recvMessage]);
  
  useEffect(()=> {
    sendMessage(`{"get":"ChatList"}`);

    const start = setInterval(()=>{
      sendMessage(`{"get":"online_status"}`);
   
        // clearInterval(start);
    }, 1000)

    return () => {
      clearInterval(start);
    }
    
  }, [])
  
  const handleImagePress = (imageSource: ImageSourcePropType) => {
    setSelectedImage(imageSource);
    setIsImageVisible(true);
  };

  const handleModalClose = () => {
    setIsImageVisible(false);
    setSelectedImage(null);
  };
  
  const { colorMode } = useTheme();
  // const { Username, setUsername } = useUser();
  
  const themeTextStyle = colorMode === 'dark' ? Colors.darkThemeText : Colors.lightThemeText;
  const themeContainerStyle = colorMode === 'dark' ? Colors.darkContainer : Colors.lightContainer;
  

  function handleChatHistoryLoad () {
    setIsChatHistoryLoaded(true);
    console.log(isChatHistoryLoaded);
  }


  return (
    <><FlatList
      data={chatData}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        // <Link 
        // style={styles.box} 
        // href={`/users/${item.name}`} 
        // // onPress={()=>{setUsername(item.name)}}
        // >
        <TouchableOpacity onPress={()=> {
          setSelectedChat(item);
        }}>
          <View style={[styles.chatItem, themeContainerStyle]}>
            <TouchableOpacity onPress={(event) => {
              event.preventDefault();
              handleImagePress(item.profileImage);
            }}>
              <Image source={item.profileImage} style={styles.profileImage} /> 
              <View style={[styles.status, { backgroundColor: online.includes(item.uname) ? "rgb(55, 203, 47)" : "gray" }]}></View>
            </TouchableOpacity>

              <View style={styles.chatContent}>
                  
                  <Text style={[styles.nameText, themeTextStyle]}>{item.name}   <Text style={[styles.nameText,{color: colorMode === 'dark' ? 'rgb(178, 175, 175)' : 'black'}]}>( {item.uname} )</Text> </Text>
                  <Text style={styles.messageText}>{item.message}</Text>
              </View>
              <Text style={styles.timestampText}>{item.timestamp}</Text>
          </View>
          </TouchableOpacity>

        // </Link> 
      )} />
      <ImageZoomModal visible={isImageVisible} onClose={handleModalClose} imageSource={selectedImage || require('@/assets/profiles/images/default.png')} />
      
      {selectedChat && ( 
      <Modal animationType='slide' transparent={true} onRequestClose={() => {setSelectedChat(null); setIsChatHistoryLoaded(false)}} >
      <GestureHandlerRootView style = {{flex:1}}>
         {isChatHistoryLoaded && (<><StatusBar backgroundColor={themeContainerStyle.backgroundColor} barStyle="light-content" />
            <View style={[styles.header, themeContainerStyle]}> 
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {setSelectedChat(null); setIsChatHistoryLoaded(false);}}>
              <Ionicons name="arrow-back-outline" color={colorMode === 'dark' ? 'white' : 'black'} size={25}  />
            </TouchableOpacity>
            {/* <Text style={[styles.headerText, {color :  colorMode === 'dark' ? 'white' : 'black'}]}>Header Bar</Text> */}
            <View style={[styles.chatItem]}>
            <TouchableOpacity onPress={(event) => {
              event.preventDefault();
              handleImagePress(selectedChat.profileImage);}}>
              <Image source={selectedChat.profileImage} style={styles.profileImage} /> 
              <View style={[styles.status, { backgroundColor: online.includes(selectedChat.uname) ? "rgb(55, 203, 47)" : "gray" }]}></View>
            </TouchableOpacity>

              <View style={styles.chatContent}>
                  <Text style={[styles.nameText, themeTextStyle]}>{selectedChat.name}</Text>
                  <Text style={styles.messageText}>{selectedChat.uname}</Text>
              </View>
              <Text style={styles.timestampText}>{selectedChat.timestamp}</Text>
          </View>
           </View></> )}
           <ChatHistory
              uname={selectedChat.uname}
              messages={[
                {
                  id: '1',
                  sender: {
                    name: 'Akshat',
                    profileImage: require('@/assets/profiles/images/2.jpg'),
                  },
                  recipient: {
                    name: 'You',
                    profileImage: require('@/assets/profiles/images/1.jpg'),
                  },
                  message: 'Yes, 2pm is awesome',
                  timestamp: '11/19/19',
                },
              ]}
              onLoad={handleChatHistoryLoad} />
          </GestureHandlerRootView>
          </Modal>)}
      
      </>
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
    maxWidth: '70%'
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
  },
  timestampText: {
    fontSize: 12,
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

