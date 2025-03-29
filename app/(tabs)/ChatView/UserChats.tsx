import React, { useEffect, useState } from 'react';

import { Link, useLocalSearchParams } from 'expo-router';
import { View, Text, ImageSourcePropType, Image, Dimensions, StyleSheet, ActivityIndicator, Modal } from 'react-native';

import { NavigationProp, ThemeContext, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ContactsStateProp } from '@/store/contactReducer';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, useWebSocket } from '@/context/WebsocketContext';
import { selectChat } from '@/store/userAction';
import ImageZoomModal from '@/components/ImageZoomModal';
import ChatView from '@/components/Chat/ChatScreen';
import ChatHeader from '@/components/Header/ChatHeader';
import { useTheme } from '@/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import changeNavigationBarColor from 'react-native-navigation-bar-color';


interface Chat {
  id: string;
  name: string;
  uname: string;
  message: string;
  timestamp: string;
  profileImage: ImageSourcePropType;
}

export default function UserChat() {
 
  console.log("UserChat Rerendered");

  // const [isImageVisible, setIsImageVisible] = useState(false);

  // const [selectedImage, setSelectedImage] = useState<ImageSourcePropType | null>(null);
  // const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const {colorMode, themeTextStyle} = useTheme();
  const { socket } = useWebSocket();


  const chatSelect = useSelector((state: ContactsStateProp) => state.ContactUpdates.chatSelect);
  const onlineUsers = useSelector((state: ContactsStateProp) => state.ContactUpdates.onlineUsers);
  const updateState = useSelector((state: ContactsStateProp) => state.ContactUpdates.updateState);
  
  const [loading, indicatorVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  useEffect(() => {
       
        const start = setInterval(() => {
      
          if(socket.current?.readyState == 1)
          {
            indicatorVisible(false)
          }
          else{
            indicatorVisible(true)
          }
    
        },100)
    
        return () => {
          if (start)
            clearInterval(start);
        }
    
      }, [])


  const deviceWidth = Dimensions.get('window').width;
  const scalefactor = deviceWidth / viewWidth;
  
  const [isVisible, setVisible] = useState(0);


  return (

    <Modal hardwareAccelerated={true} transparent={true} animationType='fade' style={{flex:1 }} visible={true} onRequestClose={() => {if(navigation.canGoBack()) navigation.goBack()}}> 
      <GestureHandlerRootView style={{flex:1}}>
        <View style={[styles.chatContent, {transform:[{scaleX: scalefactor},],  opacity: isVisible}]}>  
            { chatSelect.uname != "" && 
            (<><ChatHeader chatSelect={chatSelect} onlineUsers={onlineUsers} />
               <ChatView uname={chatSelect.uname} visible = {setVisible} /></>)
             }
            
            { (loading && <View style={styles.overlay}>
                            <ActivityIndicator color={themeTextStyle.color}/><Text style={themeTextStyle}>Reconnecting ...</Text>
                          </View>) || 
              (updateState == "wait" && 
                 <View style={styles.overlay}>
                      <ActivityIndicator color={themeTextStyle.color}/><Text style={themeTextStyle}>Updating Messages ...</Text>
                 </View>)
            }          
        </View>
     </GestureHandlerRootView>
     </Modal>
   
  )
}
const viewWidth = 400;

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
    // height: "50%",
    width: viewWidth,
    alignSelf: 'center'
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
  status: {
    position: 'absolute',
    padding: 5,
    borderRadius: 8,
    bottom: 0,
    right: 12,
  },

  header: {
    width: '100%',
    marginTop: 10,
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
    paddingLeft: 20,
    // backgroundColor: 'rgb(0, 0, 0)',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)',  
    zIndex: 1, 
    flexDirection:"row",
    alignItems: 'center',
    justifyContent:'center',
    gap: 10
  },

});