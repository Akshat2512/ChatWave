import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from "@/context/ThemeContext";
import { Colors } from '@/constants/Colors';
import { useWebSocket } from '@/context/WebsocketContext';
import FriendList from '@/components/FriendList';


export default function FriendBase() {
    const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();
   
    const { sendMessage} = useWebSocket();  

    const [name, setName] = useState('');
    const [search, loadingVisible]    = useState(false);
    const [result, resultVisible]     = useState(true);
    const [friendList, setFriendList] = useState([]);
    
 

    function handleText(input: string): void {
        setName(input);
        
        // sendMessage(`{"get":"search_friend"}`);
        // loadingVisible(true);

    }
    
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            // overflow: 'scroll',
            height: '100%',
            // bottom:0,
            // alignItems: 'center',
            // justifyContent: 'center',
            // backgroundColor: 'red',
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
            
        }
        
        
    });

    return(
        <View style={[styles.container]}>
            <TextInput style={[styles.inputText, themeTextStyle]} value={name} onChangeText={ handleText } placeholder=" Name ... " placeholderTextColor={'gray'} />
            { search && (<ActivityIndicator 
                          size="small"
                          color={ colorMode === 'dark' ? 'white' : 'black' } />) }
        {/* <KeyboardAvoidingView
           style={styles.inputContainer}
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> */}
        { <View style={styles.friendList}><FriendList input = {name} /></View>  }
        {/* </KeyboardAvoidingView> */}

        </View>
    )
}
