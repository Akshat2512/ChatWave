import { useWebSocket } from "@/context/WebsocketContext";
import { notificationAsync } from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Alert, KeyboardAvoidingView, Platform, Animated } from "react-native";
import { useUser } from "@/context/UserContext";
import { NavigationProp, StackActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/Colors";
import getResponse from "@/hooks/httpResponse";
import ActivityIndicator from "@/components/ActivityIndicator";
import useStorage from '@/hooks/useStorage';
import { useDispatch, useSelector } from "react-redux";
import { StateMngProp } from "@/store/userReducer";
import { loginAction } from "@/store/userAction";
import * as Font from 'expo-font';
import LoadingIndicator from "@/components/favicon";
import * as SplashScreen from "expo-splash-screen";



export type RootStackParamList = { "Account": undefined; "Signup": undefined } // Define the chat route

// SplashScreen.preventAutoHideAsync();

// // Set the animation options. This is optional.
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });

export default function Login() {

    const [username, setUName] = useState('');
    const [password, setPassword] = useState('');
    const [checkUser, setCheckUser] = useState('gray');
    const [checkPwd, setCheckPassword] = useState('gray');

    const { isSignedIn } = useSelector((state: StateMngProp) => state.userData)
    // const [isSignedIn, setIsSignedIn] = useState(false);

    const dispatch = useDispatch();

    const { setToken } = useUser();

    const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

    const [loading, indicatorVisible] = useState(false);


    // const [isReady, setIsReady] = useState(false);

    // const fadeAnim = useRef(new Animated.Value(1)).current;
    
    //   useEffect(() => { 
    //     loadResources().then(() => {
    //         Animated.timing(fadeAnim, {
    //                 toValue: 0,
    //                 duration: 700,
    //                 useNativeDriver: true,
    //               }).start(() => {
    //                 setIsReady(true); // Set isReady to true after the fade-out animation completes
    //               });
    //     }); 
    //   }, []);
  
    // const [loaded] = useFonts({
     
    // });
    
    
//    const loadResources = async () => {
//        const fonts = Font.loadAsync({ 
//           SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//           Convergence: require('../assets/fonts/SixtyfourConvergence-Regular-VariableFont_BLED,SCAN,XELA,YELA.ttf'),
//           Flavour: require('../assets/fonts/Flavors-Regular.ttf'),
//           Nosifier: require('../assets/fonts/Nosifer-Regular.ttf'),
//           EaterRegular: require('../assets/fonts/Eater-Regular.ttf'),
//           BonheurRoyal: require('../assets/fonts/BonheurRoyale-Regular.ttf'),
//           Nabla: require('../assets/fonts/Nabla-Regular-VariableFont_EDPT,EHLT.ttf'),
//           Charmonman: require('../assets/fonts/Charmonman-Regular.ttf'),
//           LavishlyYours: require('../assets/fonts/LavishlyYours-Regular.ttf'),
//           Neonderthaw: require('../assets/fonts/Neonderthaw-Regular.ttf'),
//           PuppiesPlay: require('../assets/fonts/PuppiesPlay-Regular.ttf'),
//           Nunito: require('../assets/fonts/Nunito-Italic-VariableFont_wght.ttf'),
//           Oswald: require('../assets/fonts/Oswald-VariableFont_wght.ttf'),
//           Roboto: require('../assets/fonts/Roboto-Italic-VariableFont_wdth,wght.ttf'),
//    });
//    // const images = Asset.loadAsync([
//    //       require('@/assets/images/splash-icon.png'),
//    //       require('@/assets/images/icon.png'),
//    //     ]);
//        await Promise.all([fonts]);
//    };

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

    const interval = useRef<NodeJS.Timeout>();
    const handleUsername = (input: string) => {
        input = input.replace(" ", "");

        setUName(input);
        // console.log(ChangeNameAction(input));

        clearTimeout(interval.current);
       
        interval.current = setTimeout( async()=>{
             if (input.length < 5) {
            setCheckUser('red');
            }
            else {
            const response = await getResponse("user", { "User": input });
            if (response["user"] == 'exist')
                setCheckUser('green');
            else
                setCheckUser('red');
            }
        }, 500);
       
    }

    const handlePassword = (input: string) => {
        setPassword(input);
        if (input.length < 5) {
            setCheckPassword('red')
        }
        else {
            setCheckPassword('transparent')
        }
        // console.log(input)
    }
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
        
    const accountnavigate = async ()=>{
         navigation.reset({
                  index: 0,
                  routes: [{ name: 'Account' }],
              });
         }
         
    const handleSubmit = async () => {
        if (username.length < 5) {
            alert("Username must be greater than 5 character")
        }
        else {
            // sendMessage(`{"user":"${username}", "pwd":"${password}"}`)
            indicatorVisible(true)
            const response = await getResponse("auth", { "user": username, "pwd": password });
            indicatorVisible(false)

            if (response["status"] == 'success') {
                setToken(response.token)
                dispatch(loginAction(username, password));
                accountnavigate();

                setUName('');
                setPassword('');
            }
            else {
                setCheckPassword('red');
                alert("Login Failed");
            }

        }
    }

    return (

        <>
          {/* {!isReady && <LoadingIndicator opacity={fadeAnim} />} */}
          
           <View style={{ flex: 1 }}>
          
            { !isSignedIn &&
                <View style={[styles.container, themeContainerStyle]}>
                    <View style={[styles.loginContainer, { backgroundColor: colorMode === "dark" ? "rgb(29, 28, 28)" : "rgb(212, 209, 209)" }]}>
                        <Text style={[styles.login, themeTextStyle]} allowFontScaling={false}>Login Details</Text>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <View style={styles.input}>
                                <TextInput style={[styles.inputText, themeTextStyle]} value={username} onChangeText={handleUsername} placeholder=" username ... " placeholderTextColor={'gray'} allowFontScaling={false} />
                                <View style={[styles.Indicator, userCheck.Indicator]}></View>
                            </View>
                            <View style={styles.input}>
                                <TextInput style={[styles.inputText, themeTextStyle]} value={password} onChangeText={handlePassword} secureTextEntry={true} placeholder=" password ... " placeholderTextColor={'gray'} allowFontScaling={false}></TextInput>
                                <View style={[styles.Indicator, pwdCheck.Indicator]}></View>
                            </View>
                        </KeyboardAvoidingView>
                        <Button title='Login' onPress={handleSubmit} />
                    </View>
                    <Button title="Create Account " onPress={() => navigation.navigate("Signup")} />
                    {loading && <View style={styles.overlay}><ActivityIndicator /></View>}
                </View>
          }
      
        </View>
       </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // borderWidth:1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    loginContainer: {
        // flex:1,
        borderWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
        // gap:10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.46)',

    },
    login: {
        padding: 10,
        fontSize: 20,
    },

    input: {
        flexDirection: 'row',
        width: 250,
        alignItems: "center",
        padding: 10,
    },

    inputText: {
        // flex:1,
        maxHeight: 40,
        borderColor: 'gray',
        width: 100,
        borderRadius: 10,
        marginRight: 10,
        borderWidth: 1,
        padding: 10,
        flexGrow: 1,

        // flexDirection:'row', 
    },
    Indicator: {
        // borderWidth: 1,
        padding: 4,
        borderRadius: 8,
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