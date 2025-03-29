import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Image, StyleSheet, ImageSourcePropType, TouchableOpacity, Button } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import ImageZoomModal from './ImageZoomModal';

import { useUser } from '@/context/UserContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useWebSocket } from '@/context/WebsocketContext';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { friendsProp, StateMngProp } from '@/store/userReducer';


export type RootStackParamList = {  "Account": undefined; "UserChat": undefined } // Define the chat route

export default function FriendList({input}: { input: string }) {
  console.log("FriendList Rerendered");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const [ selectedImage, setSelectedImage ] = useState<ImageSourcePropType | null>(null);
  const { sendMessage, recvMessage } = useWebSocket();
  const [search, loadingVisible] = useState(false);
  const [usr_img, setUsrImage] = useState<{ [key: string]: string }>({});

 var {userName, passWord, friends} = useSelector((state: StateMngProp) => state.userData);
  const [result, setFriendList] = useState<friendsProp[]>([]);


  // useEffect(()=>{
  //   if(friends){
  //     setFriendList(friends);  
  //   }
  // }, [friends]);

    
  useEffect(() => {
      const regex = new RegExp(input, "i");
      const filterLists = friends.filter(item => regex.test(item.uname) || regex.test(item.name ?? ''));
      setFriendList(filterLists);
  }, [input, friends])


  useEffect(()=>{
    if(recvMessage){
      if(recvMessage["friend_req"] == "sent"){
        console.log("Friend request sent");
      }
    }
  }, [recvMessage])
  
  const handleImagePress = (imageSource: ImageSourcePropType) => {
    setSelectedImage(imageSource);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  }
  

  const { colorMode, themeTextStyle, themeContainerStyle  } = useTheme();
  
    function sendFriendRequest(uname:string) {
        const updatedFriends = result.map((element:  any) => 
           element.uname === uname && element.status === "none" ? { ...element, status: "pending" } : element);
        if(updatedFriends)
         setFriendList(updatedFriends);
        sendMessage(`{"send":"friend_req", "to":"${uname}"}`);
    }
   
    function removeFriend(uname:string) {
        const updatedFriends = result.map((element:  any) => 
            element.uname === uname && element.status !== "none" ? { ...element, status: "none" } : element);
        if(updatedFriends)
           setFriendList(updatedFriends);

       
        sendMessage(`{"send":"del_friend_req", "from":"${uname}"}`);
      
    }

    function AddFriend(uname: any): void {
        const updatedFriends = result.map((element:  any) => 
            element.uname === uname && element.status !== "none" ? { ...element, status: "accepted" } : element);
        if(updatedFriends)
           setFriendList(updatedFriends);

        sendMessage(`{"send":"acc_friend_req", "of":"${uname}"}`);
    }

  //  function handleprofileImages(uname: string) {
  //   // console.log("req_image :", uname)
  //   // console.log(Object.keys(usr_img))
  //   sendMessage(`{"get":"profile_pic", "uname":"${uname}"}`);
  // }

  return (
    <>
    { result.length > 0 ? <FlatList
      data={result}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (

          <View style={[styles.ListItem, themeContainerStyle]}>
            <TouchableOpacity onPress={(event) => {
              event.preventDefault();
              handleImagePress(item.profileImage.uri ? item.profileImage : require("@/assets/profiles/images/default.png"));
              }}>
              <Image source={ item.profileImage.uri ? item.profileImage : require("@/assets/profiles/images/default.png") } 
                     style={styles.profileImage} 
                    //  onLoad = {()=>{ usr_img[item.uname] 
                    //                   ? console.log("found :", item.uname) 
                    //                   : handleprofileImages(item.uname)}} 
              /> 
              {/* <View style={[styles.status, { backgroundColor: online.includes(item.uname) ? "rgb(55, 203, 47)" : "gray" }]}></View> */}
            </TouchableOpacity>

              <View style={styles.chatContent}>
                  <Text style={[styles.unameText, themeTextStyle]}>{item.uname}</Text>
                  <Text style={styles.nameText}>{item.name}</Text>
              </View>
              {/* <Text style={styles.timestampText}>{item.timestamp}</Text> */}
              <TouchableOpacity style={[styles.tab]} onPress={(event) => {
                        // event.preventDefault();
                    sendFriendRequest(item.uname);}}>
              {item.status == "none" && (<Ionicons style={[themeTextStyle, styles.tab]} name="person-add-outline" size={20} />) }
              </TouchableOpacity> 
              {item.status == "pending" && (<View style={[styles.tab]}><Button title="Requested" color= "grey"
                                            onPress={()=>removeFriend(item.uname)} /></View>) }

              {item.status == "requested" && (<View style={[styles.tab, {flexDirection:"row", gap: 10, padding: 10}]}>
                                <Button title="Accept" onPress={()=>AddFriend(item.uname)} /> 
                                <Button title="X" color = "red" onPress={()=>removeFriend(item.uname)} /></View>) }
              
              {item.status == "accepted" && (<View style={[styles.tab]}><Button title = "Unfriend"
                                             onPress={()=> removeFriend(item.uname)} /></View> ) }
             
          </View>

        // </Link> 
      )} /> : <Text style={[{alignSelf:"center"},themeTextStyle]}>Not found</Text>}
      <ImageZoomModal visible={isModalVisible} onClose={handleModalClose} imageSource={selectedImage || require('@/assets/profiles/images/default.png')} /></>
  );
};

const styles = StyleSheet.create({
  ListItem: {
    flexDirection: 'row',
    width: "100%",
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#666'
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 24,
    marginRight: 12,
    borderWidth:1,
    padding: 15,
    backgroundColor:"gray"
  },
  chatContent: {
    flex: 1,
    flexGrow: 1,
    flexShrink:1,
    flexBasis:1
    
    // width:"90vw"
  },
  unameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 14,
    color: '#666',
  },
  tab:{
    paddingLeft:10,
    paddingRight:10,
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
  }
 
});

