import React, { useEffect, useReducer, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, Image, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Button, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { useTheme } from "@/context/ThemeContext";
import { Colors } from '@/constants/Colors';
import SearchList from '@/components/SearchList';
import { RootStackParamList, useWebSocket } from '@/context/WebsocketContext';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { StateMngProp } from '@/store/userReducer';
import { logoutAction } from '@/store/userAction';
import LoadingIndicator from "@/components/ActivityIndicator";
import ChangeImage from '@/components/imagePicker';
import ImageZoomModal from '@/components/ImageZoomModal';
import { NavigationProp, useNavigation } from '@react-navigation/native';


export default function UserProfile() {
    const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

    const {connected, sendMessage, socket} = useWebSocket();  
   

    // const [name, setName] = useState('');
    const [search, loadingVisible]    = useState(false);
    const [date, setDate]  = useState("");
    const [searchList, setSearchList] = useState([]);
    // const [selectedImage, setSelectedImage] = useState<any | null>(null);
    
    const { profileImg, profileDetails, userName } = useSelector((state : StateMngProp) => state.userData);
    
    const name = useRef(profileDetails.name);
    const inputRef = useRef<TextInput>(null);

    const [click, isEditImage] = useState(false);

    const [loading, indicatorVisible] = useState(false);
    
    const [ isImageVisible, setIsImageVisible ] = useState(false);
    
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    
    const dispatch = useDispatch();

    const handleImageSelect = (imageInfo: any) => {
      
     indicatorVisible(true);

     var base64_string = imageInfo ? imageInfo.base64 : null;

     const payload = {
                        "update": "profileImg",
                        "base64_string": base64_string
                       }

     sendMessage(JSON.stringify(payload));
     
     indicatorVisible(false);
      // profileImg.uri = imageInfo.uri;
      isEditImage(false); // Close ChangeImage component after selecting image 
    };
    
    const handleNameUpdate = () => {
      const payload = `{
        "update": "profileName",
        "name": "${name.current}"
      }`
      indicatorVisible(true);
      sendMessage(payload);
      indicatorVisible(false);
      setSaveButton(false);
    }

     const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    
     const handleLogout = async ()=>{
       
            dispatch(logoutAction());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
          });
            socket.current?.close();
              connected.current = false;
          }
     

    
  const [showSaveButton, setSaveButton] = useState(false);
  
  const handleText = (text: string) => {

    name.current = text;
    if(text != profileDetails.name)
    {   
        setSaveButton(true);
    }
   else{
        setSaveButton(false)
   }
  };
  
        useEffect(() => {
           
            const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if(click)
            {
              isEditImage(false);
              e.preventDefault();
            }
            else
             {
              navigation.dispatch(e.data.action);
              isEditImage(true);
             } 
          //    console.log(click)
  
          //   isEditImage(false)
         
              // Alert.alert(
              //   'Confirm Exit',
              //   'Are you sure you want to exit?',
              //   [
              //     { text: 'Cancel', style: 'cancel', onPress: () => {} },
              //     {
              //       text: 'Yes',
              //       onPress: () => navigation.dispatch(e.data.action),
              //     },
              //   ]
              // );
            });
            
            return unsubscribe;
          }, [click]);
  
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


  useEffect(()=>{
    const keyboard = Keyboard.addListener("keyboardDidHide", ()=>{
      inputRef.current?.blur();
    })
    // convertUTCtoTimeZone(profileDetails.created_on);
    return ()=>{
      keyboard.remove();
    }
  }, []);

 
  const handleImagePress = (imageSource: {uri: string | null}) => {
    setSelectedImage(imageSource);
    setIsImageVisible(true);
  };

  
  const handleModalClose = () => {
    setIsImageVisible(false);
    setSelectedImage(null);
  };
  

    return(
      <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss();}}>
        <View style={[styles.container, themeContainerStyle]}>
            {/* <TextInput style={[styles.inputText, themeTextStyle]} value={name} onChangeText={ handleText } placeholder=" Name ... " placeholderTextColor={'gray'} /> */}
            { search && <ActivityIndicator size="small" color={colorMode === 'dark' ? 'white' : 'black'} /> }
            {<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.profileContainer}>
                        {/* {selectedImage ? (<Image source={{ uri: selectedImage }} style={styles.profileImage} />): */}
                        <TouchableOpacity onPress={()=>handleImagePress({uri:profileImg.uri})}>
                          <Image source={profileImg.uri ? profileImg : require("@/assets/profiles/images/default.png")} style={styles.profileImage} />
                        </TouchableOpacity>
                        <Ionicons name="create-outline" size={20} color={colorMode === 'dark' ? "white" : "black"} style={ styles.editIcon } onPress = {(event)=>{ event.preventDefault(); isEditImage(true);}}/>
                    </View>
                    <View style={[styles.userInfo]}>
                      <View>
                        <View style={styles.Info}>
                           <Text style={[{fontSize:15}, themeTextStyle]} allowFontScaling={false}>Name:             <TextInput ref={inputRef}
                                                                                                                    style={[styles.inputText,
                                                                                                                           themeTextStyle]} 
                                                                                                                    allowFontScaling={false}
                                                                                                                    onChangeText={handleText} >
                                                                                                                            {profileDetails.name}
                                                                                                                    </TextInput>
                   
                            </Text>  
                        {  showSaveButton ?   <TouchableOpacity style={styles.button} onPress={handleNameUpdate}>
                                                      <Text style={styles.buttonText} allowFontScaling={false}>Save</Text>
                                              </TouchableOpacity> 
                                                  : <Ionicons name="create-outline" size={10} color={colorMode === 'dark' ? "white" : "black"} style={styles.textIcon} /> }
                        </View>
                        <Text style={[{fontSize:15},themeTextStyle]} allowFontScaling={false}>Username:       <Text style={[{fontSize:15}]} allowFontScaling={false}>{userName}</Text></Text> 
                        <Text style={[{fontSize:15},themeTextStyle]} allowFontScaling={false}>Created on:      <Text style={[{fontSize:12}]} allowFontScaling={false}>{profileDetails.created_on}</Text></Text> 
                      </View>
                    </View>
                    
                    
            </KeyboardAvoidingView>
          }

              { !click && <View style={[styles.logoutContainer]}>
                   <TouchableOpacity 
                    onPress={handleLogout}>
                    <Text style={[styles.logoutTextStyle, themeTextStyle]}>Logout</Text>
                    </TouchableOpacity>
                </View>}


                { click && ( <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => { isEditImage(false); }} /> )}

                { click && ( <ChangeImage onImageSelect={handleImageSelect} /> ) }

                { loading && <View style={styles.overlay}><LoadingIndicator/></View> }
        

          <ImageZoomModal 
          visible={isImageVisible} 
          onClose={handleModalClose} 
          imageSource={selectedImage || require('@/assets/profiles/images/default.png')} />
        </View>
        </TouchableWithoutFeedback>
    )
}



const styles = StyleSheet.create({   
  profileContainer: {
     width: "100%",
    //  maxWidth:0,
     // height: "auto",
     alignItems: "center",
   },
  
   userInfo: {
    //  flexDirection:'column',
    //  justifyContent: 'center',
    //  alignItems: 'center',
    //  gap: 5,
     padding: 40,

   },

   Info:{
     flexDirection: 'row',
      alignItems: 'flex-end', 
      justifyContent: 'flex-start',
      height: 30
      //  gap: 15
   },

   button: {
    backgroundColor: '#007bff', // Button background color
    paddingHorizontal: 10, // Button padding
    paddingVertical: 3,
    borderRadius: 5, // Button border radius
    alignItems: 'center', // Center the text horizontally
    margin: 0, // Margin around the button
    // position: "absolute",
    right: -20,
  },
  textIcon:{
    right: -20,
  },

  buttonText: {
    color: '#fff', // Text color
    fontSize: 16, // Text size
    fontWeight: 'bold', // Text weight
  },
  profileImage: {
     // flex:1,
     width: 200,
     height: 200,
     borderRadius: 100,
   },
   container: {
        // borderWidth: 1,
         flex: 1,
         // overflow: 'scroll',
         height: '100%',
         gap: 30,
         justifyContent: 'center',
         padding: 10
     },

     inputText:{
      fontSize:15, 
      borderWidth:0.3, 
      borderRadius: 5,
      borderColor: "gray",
      paddingHorizontal: 10,
      // flex:1,
      width: 170
    },


    notfound:{
         borderWidth:1,
         flex:1,
         textAlign:'center',
         justifyContent:'center',
         alignItems:'center',
       },
    
    editIcon:{
         position: "absolute",
         bottom: 0,
         right: 40
    },
   

   logoutContainer:{
     // flex:1,
     alignItems: 'center',
     justifyContent:'flex-end',
      zIndex: 2,
     // alignSelf:"flex-end"
   },
   logoutTextStyle:{
     textAlign:"center", 
     padding: 10,
     marginBottom: 30,
     fontSize: 20,
     borderRadius:10,
     backgroundColor: "rgba(224, 24, 14, 0.29)",
 
   },
   overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)',  
    zIndex: 1, 
  },
 

 });
