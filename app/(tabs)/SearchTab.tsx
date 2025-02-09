import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from "@/context/ThemeContext";
import { Colors } from '@/constants/Colors';
import ChatList from '@/components/ChatList';
import SearchList from '@/components/SearchList';
import { useWebSocket } from '@/context/WebsocketContext';


export default function SearchUserBase() {
    const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

    const {search_res, sendMessage, recvNotify} = useWebSocket();  

    const [name, setName] = useState('');
    const [search, loadingVisible]    = useState(false);
    const [result, resultVisible]     = useState(false);
    const [searchList, setSearchList] = useState([]);

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
            { search && <ActivityIndicator size="small" color={colorMode === 'dark' ? 'white' : 'black'} /> }

               <KeyboardAvoidingView
                       style={styles.inputContainer}
                       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            { name.length!=0 && (result ? <View style={styles.friendList}><SearchList result = { searchList } setSearchList = { setSearchList } /></View> : <View style={{flex:1}}><Text style={[{textAlign:"center", color:"rgb(54, 54, 54)"}]}>Users not found</Text></View>) }
            </KeyboardAvoidingView>
        </View>
    )
}
