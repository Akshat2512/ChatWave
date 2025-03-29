import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StatusBar, TouchableOpacity, View, Image, Text, ImageSourcePropType, StyleSheet } from "react-native";
import { RootStackParamList, useWebSocket } from '@/context/WebsocketContext';
import ImageZoomModal from "../ImageZoomModal";
import { ContactsStateProp } from "@/store/contactReducer";
import { useSelector } from "react-redux";
import { StateMngProp } from "@/store/userReducer";



export default function ChatHeader({chatSelect, onlineUsers}:{chatSelect: ContactsStateProp["ContactUpdates"]["chatSelect"], onlineUsers: ContactsStateProp["ContactUpdates"]["onlineUsers"] }){
    
      console.log("ChatHeader Rerendered");
         

      const [isImageVisible, setIsImageVisible] = useState(false);
    
      const [ isModalVisible, setIsModalVisible ] = useState(false);
      const [ selectedImage, setSelectedImage ] = useState<{uri:string} | null>(null);
      const { sendMessage, recvMessage } = useWebSocket();
      const [search, loadingVisible] = useState(false);

      const {friends} = useSelector((state: StateMngProp) => state.userData)
      const item = friends.find((e)=>e.uname == chatSelect.uname);

      const {colorMode, themeContainerStyle, themeTextStyle} = useTheme();
      const navigation = useNavigation<NavigationProp<RootStackParamList>>();
 
      const handleImagePress = (imageSource: {uri: string} | null) => {
        setSelectedImage(imageSource);
        setIsModalVisible(true);
        setIsImageVisible(true);

      };
    
      const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedImage(null);
        setIsImageVisible(false);

      };
      
    

    return (
        <>
        <StatusBar backgroundColor={themeContainerStyle.backgroundColor} />  
        <View style={[styles.header, themeContainerStyle]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => { if(navigation.canGoBack()) navigation.goBack()} } >
            <Ionicons name="arrow-back-outline" color={colorMode === 'dark' ? 'white' : 'black'} size={25} />
          </TouchableOpacity>

          <View style={[styles.chatItem]}>
            <TouchableOpacity onPress={(event) => {
              event.preventDefault();
              if (item?.profileImage) {
                handleImagePress(item?.profileImage.uri ? {uri: item.profileImage.uri } : null);
              }

            } }>
              <Image source={ item?.profileImage.uri ? {uri: item.profileImage.uri } : require("@/assets/profiles/images/default.png")} style={styles.profileImage} />
              <View style={[styles.status, { backgroundColor: onlineUsers.includes(chatSelect.uname) ? "rgb(55, 203, 47)" : "gray" }]}></View>
            </TouchableOpacity>

            <View style={styles.chatContent}>
              <Text style={[styles.nameText, themeTextStyle]}>{item?.name}</Text>
              <Text style={styles.messageText}>{item?.uname}</Text>
             <Text style={styles.timestampText}>{onlineUsers.includes(chatSelect.uname) ? "online" : "last seen " + item?.lastseen}</Text>
            </View>
          </View>
        </View>
        <ImageZoomModal visible={isImageVisible} onClose={handleModalClose} imageSource={selectedImage || require('@/assets/profiles/images/default.png')} />
        
        </>
    ) 

}

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
  status: {
    position: 'absolute',
    padding: 5,
    borderRadius: 8,
    bottom: 0,
    right: 12,
  },

  header: {
    width: '100%',
    // paddingTop: 15,
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

});