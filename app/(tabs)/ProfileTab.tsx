import React, { useEffect, useReducer, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, Image, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from "@/context/ThemeContext";
import { Colors } from '@/constants/Colors';
import ChatList from '@/components/ChatList';
import SearchList from '@/components/SearchList';
import { useWebSocket } from '@/context/WebsocketContext';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { StateMngProp } from '@/store/userReducer';
import { logoutAction } from '@/store/userAction';


export default function UserProfile() {
    const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

    const {search_res, sendMessage, recvNotify} = useWebSocket();  

    const [name, setName] = useState('');
    const [search, loadingVisible]    = useState(false);
    const [result, resultVisible]     = useState(false);
    const [searchList, setSearchList] = useState([]);
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    
    const { profileImg } = useSelector((state : StateMngProp) => state.userData);

    const dispatch = useDispatch();
    // const name = useSelector()

    useEffect(()=>{
        if(search_res["search_users"]){
            if(search_res["search_users"] == "not_found"){
                resultVisible(false);
            }
            else{
                setSearchList(search_res["search_users"]);
                resultVisible(true);
                // console.log(searchList);
            }
            loadingVisible(false) 
            console.log(search_res);
        }
    }, [search_res]);

     useEffect(()=>{
      if(recvNotify["notification"]){
       if(recvNotify["notification"] == "Update Friend Tab"){
        
         sendMessage(`{"get":"search_users",  "input":"${name}"}`);
      }
     }
     }, [recvNotify]);

    function handleText(input: string): void {
        setName(input);
        if(input.length != 0)
        {
            sendMessage(`{"get":"search_users", "input":"${input}"}`);
            loadingVisible(true);
        }
        setSearchList([]);

    }
    
    const styles = StyleSheet.create({   
     profileContainer: {
        // borderWidth:1,
        // maxWidth:"100",
        // height: "auto",
        alignItems: "center",
      },
     profileImage: {
        // flex:1,
        width: 100,
        height: 100,
        borderRadius: 50,
      },
        container: {
            flex: 1,
            // overflow: 'scroll',
            height: '100%',
            gap: 30,
            // bottom:0,
            // alignItems: 'center',
            // justifyContent: 'center',
            padding: 15,
        },
        inputText: { 
            maxHeight: 40, 
            borderColor: 'gray',
            borderRadius:10, 
            marginRight:10,
            borderWidth: 1, 
            padding: 10,
            width: '100%',
          },
          inputContainer: { 
            // flex: 1, 
            // borderWidth:1,
            flexDirection:'row',
            alignItems: 'center',
            // flexGrow: 1, 
       
            paddingVertical:20,
          },
      friendList:{
            flex:1,
            
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
            right: 50
       },


      logoutContainer:{
        // flex:1,
        alignItems: 'center',
        justifyContent:'flex-end',
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

    function updateProfilePicture() {
        throw new Error('Function not implemented.');
    }


    function handleLogout(): void {
        dispatch(logoutAction());
    }

    return(
        <View style={[styles.container, themeContainerStyle]}>
            {/* <TextInput style={[styles.inputText, themeTextStyle]} value={name} onChangeText={ handleText } placeholder=" Name ... " placeholderTextColor={'gray'} /> */}
            { search && <ActivityIndicator size="small" color={colorMode === 'dark' ? 'white' : 'black'} /> }
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.profileContainer}>
                        {/* {selectedImage ? (<Image source={{ uri: selectedImage }} style={styles.profileImage} />): */}
                        <Image source={profileImg} style={styles.profileImage} />
                        <Ionicons name="create-outline" size={20} color={colorMode === 'dark' ? "white" : "black"} style={ styles.editIcon } onPress = {(event)=>{ event.preventDefault(); updateProfilePicture();}}/>
                    </View>
                    
            </KeyboardAvoidingView>


            {/* <KeyboardAvoidingView
                       style={styles.inputContainer}
                       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            { name.length!=0 && (result ? <View style={styles.friendList}><SearchList result = { searchList } setSearchList = { setSearchList } /></View> : <View style={{flex:1}}><Text style={[{textAlign:"center", color:"rgb(54, 54, 54)"}]}>Users not found</Text></View>) }
            </KeyboardAvoidingView> */}

                <View style={[styles.logoutContainer, themeContainerStyle]}>
                   <TouchableOpacity style={themeContainerStyle} 
                    onPress={handleLogout}>
                    <Text style={[styles.logoutTextStyle, themeTextStyle]}>Logout</Text>
                    </TouchableOpacity>
                </View>
        </View>
    )
}

