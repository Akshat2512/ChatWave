import { useWebSocket } from "@/context/WebsocketContext";
import { notificationAsync } from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useUser } from "@/context/UserContext";
import { NavigationProp, StackActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/Colors";
import getResponse from "@/hooks/httpResponse";
import LoadingIndicator from "@/components/ActivityIndicator";
import useStorage from '@/hooks/useStorage';
import { useDispatch, useSelector } from "react-redux";
import { StateMngProp } from "@/store/userReducer";
import { setUserCredentialAction, loginAction } from "@/store/userAction";

export type RootStackParamList = {  "Account": undefined; "Signup": undefined } // Define the chat route


export default function Login(){
    
    const storage = useStorage();
    const [username, setUName] = useState(''); 
    const [password, setPassword] = useState('');
    const [checkUser, setCheckUser] = useState('gray');
    const [checkPwd, setCheckPassword] = useState('gray');
    
    // const [isSignedIn, setIsSignedIn] = useState(false);

     
    const dispatch = useDispatch();
    
    const { setToken } = useUser();
  
    const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

    const [loading, indicatorVisible] = useState(false);
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    
      
    const userCheck = StyleSheet.create({
        Indicator: {
            backgroundColor: checkUser
          }
    })
    const pwdCheck = StyleSheet.create({
        Indicator: {
            backgroundColor: checkPwd
          }
    })
    
    useFocusEffect(()=>{
        // useCallback(() => {
            ifCredentials();
        //   }, [])
    })
    
    const ifCredentials = async () => {
        const user = await storage.getItem("@username");
        // console.log(user)
        if(user){
                //   navigation.dispatch(StackActions.replace('Account'));
                  setCredentials(username, password);
        }
    }

    const setCredentials = async (username: string, password: string) => {
        await storage.setItem("@username", username);
        await storage.setItem("@password", password);
    }


    const handleUsername = async (input: string) => {
            input = input.replace(" ", "");
    
            setUName(input);  
            // console.log(ChangeNameAction(input));
            

            if (input.length < 5) {
                setCheckUser('red');
            }
            else{
               const response = await getResponse("user", { "User": input });
                if(response["user"] == 'exist')
                    setCheckUser('green');
                else
                    setCheckUser('red');
            }
        }
   
    const handlePassword = (input: string) => {
        setPassword(input);
        if(input.length < 5){
            setCheckPassword('red')
        }
        else
        {
            setCheckPassword('transparent')
        }
        // console.log(input)
    }

    const handleSubmit = async ()=> {
      if(username.length < 5){
           alert("Username must be greater than 5 character")
      }
      else
      {
        // sendMessage(`{"user":"${username}", "pwd":"${password}"}`)
        indicatorVisible(true)
        const response = await getResponse("auth", { "user": username, "pwd": password });
        indicatorVisible(false)

        if(response["status"] == 'success')
        { 
            setToken(response.token)
             
            dispatch(loginAction());
            dispatch(setUserCredentialAction(username, password))
            
            navigation.dispatch(StackActions.replace('Account'));
            // setCredentials(username, password);
        }
        else{
              setCheckPassword('red');
              alert(response.error);
        }
          
       }
    }

    return (
       
        <View style={[styles.container, themeContainerStyle]}>
            <View style={[styles.loginContainer, {backgroundColor: colorMode==="dark" ? "rgb(29, 28, 28)" : "rgb(212, 209, 209)"} ]}>
                <Text style={[styles.login, themeTextStyle]}>Login Details</Text>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.input}>
                        <TextInput style={[styles.inputText, themeTextStyle]} value={username} onChangeText={handleUsername} placeholder= " username ... " placeholderTextColor={'gray'} />
                        <View style={[styles.Indicator, userCheck.Indicator]}></View>
                    </View>
                    <View style={styles.input}>
                        <TextInput style={[styles.inputText, themeTextStyle]} value={password} onChangeText={handlePassword} secureTextEntry={true} placeholder= " password ... "  placeholderTextColor={'gray'}></TextInput>
                        <View style={[styles.Indicator, pwdCheck.Indicator]}></View>
                    </View>
                </KeyboardAvoidingView>
                <Button title='Login' onPress={handleSubmit}/>
            </View>
            <Button title="Create Account " onPress = { ()=>navigation.navigate("Signup") }/>
            { loading && <View style={styles.overlay}><LoadingIndicator /></View>}
            
        </View>
      
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        // borderWidth:1,
        alignItems: 'center',
        justifyContent:'center',
        gap:10,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    loginContainer:{
        // flex:1,
        borderWidth:0,
        alignItems: 'center',
        justifyContent:'center',
        // gap:10,
        paddingVertical: 15,
        paddingHorizontal:20,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 3.84,  
        elevation: 3,
    
    },
    login:{
        padding: 10,
        fontSize:20,
    },

    input:{
        flexDirection:'row',
        width:250,
        alignItems:"center",
        padding: 10,
    },

    inputText: { 
        // flex:1,
        maxHeight: 40, 
        borderColor: 'gray',
        width:100,
        borderRadius:10, 
        marginRight:10,
        borderWidth: 1, 
        padding: 10,
        flexGrow:1,
        
        // flexDirection:'row', 
      },
      Indicator: {
        // borderWidth: 1,
        padding:4,
        borderRadius:8,
      },
      overlay: { 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)',  
        zIndex: 0, 
      },

     
});