import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from "@/context/ThemeContext";
import { Colors } from '@/constants/Colors';
import SearchList from '@/components/SearchList';
import { useWebSocket } from '@/context/WebsocketContext';
import { useDispatch } from 'react-redux';
import { setSearchList } from '@/store/userAction';


export default function SearchUserBase() {
    const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

    const { sendMessage } = useWebSocket();  

    const [name, setName] = useState('');
    const [loading, loadingVisible]    = useState(false);
    const dispatch = useDispatch();

   
const interval = useRef<NodeJS.Timeout>();

    function handleText(input: string): void {

        clearInterval(interval.current);
         setName(input);
         dispatch(setSearchList([]));
        interval.current = setTimeout(()=> {
              
        if(input.length != 0)
        {
            sendMessage(`{"get":"search_users", "input":"${input}"}`);
        }
        else{
            dispatch(setSearchList([]));
        }
        loadingVisible(true);
        }, 1000)
     

    }



    
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            // overflow: 'scroll',
            height: '100%',
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
          }
        
        
    });
    
    return(
        <View style={[styles.container, themeContainerStyle]}>
            <TextInput style={[styles.inputText, themeTextStyle]} value={name} onChangeText={ handleText } placeholder=" Name ... " placeholderTextColor={'gray'} />
            {  name.length!=0 && loading && <ActivityIndicator size="small" color={colorMode === 'dark' ? 'white' : 'black'} /> }

               <KeyboardAvoidingView
                       style={styles.inputContainer}
                       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
             { name.length!=0 && <SearchList  loadingVisible = {loadingVisible} input = {name}/>}
            {/* { name.length!=0 && (result ? <View style={styles.friendList}><SearchList result = { searchList } setSearchList = { setSearchList } /></View> : <View style={{flex:1}}><Text style={[{textAlign:"center", color:"rgb(54, 54, 54)"}]}>Users not found</Text></View>) } */}
            </KeyboardAvoidingView>
        </View>
    )
}
