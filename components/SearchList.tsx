import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Image, StyleSheet, ImageSourcePropType, TouchableOpacity, Button } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import ImageZoomModal from './ImageZoomModal';
// import ChatHistory from './ChatHistory';

import { useUser } from '@/context/UserContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useWebSocket } from '@/context/WebsocketContext';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { ContactsStateProp } from '@/store/contactReducer';
import { StateMngProp } from '@/store/userReducer';



export type RootStackParamList = {  "Account": undefined; "UserChat": undefined } // Define the chat route

export default function SearchList({ loadingVisible, input }: { loadingVisible: React.Dispatch<React.SetStateAction<boolean>>, input: string }) {
  
 
  console.log("SearchList Rerendered");

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const [ selectedImage, setSelectedImage ] = useState<ImageSourcePropType | null>(null);
  const { sendMessage, recvMessage } = useWebSocket();
  const [searchImg, setSearch] = useState(false);
  // const {recvImage} = useWebSocket();
  var { searchUser } = useSelector((state: ContactsStateProp) => state.ContactUpdates)
   const { userName, friends, profileImg } = useSelector((state: StateMngProp) => state.userData);
  const [usr_img, setUsrImage] = useState<any>(userName ? {uname: userName, profileImg: profileImg.uri} : {});
  
  // console.log(usr_img);

  useEffect(()=>{
    loadingVisible(false);
    
    const item = searchUser.find((u: any) => u.uname == userName);
      if(item){
        item.profileImg = profileImg.uri;
      }

    searchUser.forEach((e: any) => {
      const item = friends.find(f => f.uname == e.uname);
      if(item){
       e.profileImg = item.profileImage.uri;
     console.log("Get image from storage: ",e.uname);

      }
      else{
        if(e.uname != userName)
          sendMessage(`{"get":"profile_pic", "uname":"${e.uname}"}`)
  

      }
    })
   



  }, [searchUser])


  useEffect(()=>{
  
  }, [])
  // useEffect(()=>{
  
  //   if(recvImage){
  //         if(recvImage["profile_pic"] && recvImage["uname"]){
  //         // console.log(recvImage['uname']);
  //         const img: any = usr_img;
  //         img[recvImage["uname"]] = recvImage["profile_pic"];
  //         setUsrImage(img);
  //         // console.log(Object.keys(usr_img))
  //         // console.log(recvImage['uname'])
  //         // usr_img[images["uname"]] = images["uname"];

  //         // console.log(usr_img) 
  //           // console.log(images);
  //         }
  //       }


  //     }, [recvImage]);
  // useEffect(()=>{
  //   if(recvMessage){
  //     if(recvMessage["friend_req"] == "sent"){
  //       console.log("Friend request sent");
  //     }
  //   }
  // }, [recvMessage])
  
  const handleImagePress = (imageSource: ImageSourcePropType) => {
    setSelectedImage(imageSource);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };
  

  const { colorMode } = useTheme();
  
  const themeTextStyle = colorMode === 'dark' ? Colors.darkThemeText : Colors.lightThemeText;
  const themeContainerStyle = colorMode === 'dark' ? Colors.darkContainer : Colors.lightContainer;
  
  
  function sendFriendRequest(uname:string) {
    const search = searchUser.find((element:  any) => 
       element.uname === uname && element.status === "none");
    if(search){
      search.status = 'pending';
    }

   
    sendMessage(`{"send":"friend_req", "to":"${uname}"}`);
}

function removeFriend(uname:string) {
    const search = searchUser.find((element:  any) => 
        element.uname === uname && element.status !== "none");

    if(search){
      search.status = 'none';
    }


    // if(updatedFriends)
    //    setSearchList(updatedFriends);

    sendMessage(`{"send":"del_friend_req", "from":"${uname}"}`);
  
}


function AddFriend(uname: any): void {
    const search = searchUser.find((element:  any) => 
      element.uname === uname && element.status !== "none");

    if(search){
      search.status = 'accepted';
    }


  sendMessage(`{"send":"acc_friend_req", "of":"${uname}"}`);
}

  //  function handleprofileImages(uname: string) {

  //   sendMessage(`{"get":"profile_pic", "uname":"${uname}"}`);
  // }

  return (
    <><FlatList
      data={searchUser}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (

        <TouchableOpacity onPress={()=> {
          // navigation.navigate("UserChat")
        }}>
          <View style={[styles.ListItem, themeContainerStyle]}>
            <TouchableOpacity onPress={(event) => {
              event.preventDefault();
              handleImagePress(item.profileImg ? {uri:`${item.profileImg}`} : require('@/assets/profiles/images/default.png'));
              }}>
              <Image source={item.profileImg ? {uri:`${item.profileImg}`} : require('@/assets/profiles/images/default.png')} style={styles.profileImage} 
                // onLoad = {()=>{usr_img[item.uname] ? console.log("found :", item.uname) : handleprofileImages(item.uname)}}
                /> 
              {/* <View style={[styles.status, { backgroundColor: online.includes(item.uname) ? "rgb(55, 203, 47)" : "gray" }]}></View> */}
            </TouchableOpacity>

              <View style={styles.chatContent}> 
                  <Text style={[styles.unameText, themeTextStyle]}>{item.uname}</Text>
                  <Text style={styles.nameText}>{item.name}</Text>
              </View>
              {/* <Text style={styles.timestampText}>{item.timestamp}</Text> */}
             { item.uname!=userName && <TouchableOpacity style={[styles.tab]} onPress={(event) => {
                        // event.preventDefault();
                        sendFriendRequest(item.uname);}}>
            
                      {item.status == "none" && (<Ionicons style={[themeTextStyle]} name="person-add-outline" size={20}  />) }          
              </TouchableOpacity>}
              
              {item.status == "pending" && (<View style={[styles.tab]}>
                                            <Button title="Requested" color= "grey"
                                             onPress={()=>removeFriend(item.uname)} /></View> ) }

              {item.status == "requested" && (<View style={[styles.tab, {flexDirection:"row", gap: 10, padding: 10}]}>
                                              <Button title="Accept" onPress={()=>AddFriend(item.uname)} /> 
                                              <Button title="X" color = "red" onPress={()=>removeFriend(item.uname)} /></View>) }
                            
              {item.status == "accepted" && (<View style={[styles.tab]}><Button title = "Unfriend"
                                         onPress={()=> removeFriend(item.uname)} /></View> ) }
             
          </View>
          </TouchableOpacity>

        // </Link> 
      )} />
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
  },

 
});

