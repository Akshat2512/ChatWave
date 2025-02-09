import { useWebSocket } from "@/context/WebsocketContext";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Alert, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useUser } from "@/context/UserContext";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/Colors";
import getResponse from "@/hooks/httpResponse";
import { Ionicons } from "@expo/vector-icons";
import  ChangeImage  from "@/components/imagePicker";
import { base64ToUint8Array } from "@/hooks/imgbase64ToBytes";
import LoadingIndicator from "@/components/ActivityIndicator";

export type RootStackParamList = { "Login": undefined, "ProfileImage": undefined } // Define the chat route

export default function Signup(){
    
    const [name, setName] = useState('');
    const [click, isEditImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    const [password, setPassword] = useState('');
    const [checkName, setCheckName] = useState('gray');
    const [checkUser, setCheckUser] = useState('gray');
    const [checkPwd, setCheckPassword] = useState('gray');
    const [ username, setUsername ] = useState('');
    const {setUName} = useUser();
    const { recvMessage, setMessage, sendMessage } = useWebSocket();
    const [loading, indicatorVisible] = useState(false);
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

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
    
    const handleImageSelect = (imageInfo: any) => {
         setSelectedImage(imageInfo);
        //  console.log(imageInfo) 
         isEditImage(false); // Close ChangeImage component after selecting image 
    };
    
    const nameCheck = StyleSheet.create({
        Indicator: {
            backgroundColor: checkName
        }
    });
      
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


    const handleName = (input: string) => {
        const regex = /^[A-Za-z\s]*$/;
        input = input.replace("  ", " ")
        
        if(input.length == 1)
         input = input.toUpperCase()

        if (regex.test(input)) { 
            setName(input);
        }
        
        if (input.length == 0) {
            setCheckName('red');
        }
        else{
            setCheckName('green');
        }
    }
    
    const handleUsername= async (input: string) => {
        input = input.replace(" ", "");
        setUsername(input);
        if (input.length < 5) {
            setCheckUser('red');
        }
        else{
           const response = await getResponse("user", { "User": input });
            if(response["user"] == 'exist'){
                 setCheckUser('red');
            }
               
            else{
                setCheckUser('green');
            }
        }
    }
   
    const handlePassword = (input: string) => {
        setPassword(input);
        if(input.length < 5){
            setCheckPassword('red');
        }
        else
        {
            setCheckPassword('transparent');
        }
        // console.log(input);
    }

    // const uploadImage = async () => { 
    //     const formData = new FormData(); 
    //     formData.append('photo', { uri: new Blob(), type: 'image/jpeg', name: 'photo.jpg', });
    //     try { 
    //         const response = await fetch('https://your-server-endpoint/upload', { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data', }, });
    //         const responseData = await response.json(); 
    //         console.log('Upload success:', responseData); 
    //         alert('Upload success!'); 
    //     } 
    //     catch (error) {
    //          console.error('Upload failed:', error); 
    //          alert('Upload failed!'); 
    //     } };
    
    

    const handleSubmit = async ()=> {
      if (name.length == 0)
      {
        alert("Name cannot be empty");
      }
      else if(username.length < 5){
        //    Alert.alert('Username must be greater than 5 character')
        alert("Username must be greater than 4 character");
      }
      else{
         
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toTimeString().split(" ")[0];
        const currentDateTime = currentDate + "T" + currentTime;


         var data: any = {"name":name,"user":username, "pwd": password, "created_on": currentDateTime};
         var usr = await getResponse("user",  { "User": username});
        //  console.log(usr)
         if( usr.user == "exist" )
         {  
             alert("Username already exist, select another one!!");
             return;     
         }

         indicatorVisible(true);
         if (selectedImage)
          { 
            data["profile_img"] = selectedImage.base64
          }
         
        //  console.log(data)
          const response = await getResponse("create", data);
          indicatorVisible(false);
          if(response["account"]=="Account successfully created")
          {
            // setName("");
            // setUName("");
            // setPassword("");
            navigation.goBack();
          }
          alert(response["account"])
         
       }
       
    }
    
    function updateProfilePicture() {
        isEditImage(true);
            // isEditImage(false)
    }

    return (
       
        <View style={[styles.container, themeContainerStyle]}>
            <View style={[styles.loginContainer, {backgroundColor: colorMode==="dark" ? "rgb(29, 28, 28)" : "rgb(212, 209, 209)"} ]}>
                <Text style={[styles.login, themeTextStyle]}>Create New Account</Text>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.profileContainer}>
                        {/* {selectedImage ? (<Image source={{ uri: selectedImage }} style={styles.profileImage} />): */}
                         <Image source={selectedImage ? { uri: selectedImage.uri } : require("@/assets/profiles/images/default.png")} style={styles.profileImage} />
                        <Ionicons name="create-outline" size={20} color={colorMode === 'dark' ? "white" : "black"} style={ styles.editIcon } onPress = {(event)=>{ event.preventDefault(); updateProfilePicture();}}/>
                    </View>
                    <View style={styles.input}>
                        <TextInput style={[styles.inputText, themeTextStyle]} value={name} onChangeText={ handleName } placeholder=" Name ... " placeholderTextColor={'gray'} />
                        <View style={[styles.Indicator, nameCheck.Indicator]}></View>
                    </View>
                    <View style={styles.input}>
                        <TextInput style={[styles.inputText, themeTextStyle]} value={username} onChangeText={ handleUsername } placeholder=" Username ... " placeholderTextColor={'gray'} />
                        <View style={[styles.Indicator, userCheck.Indicator]}></View>
                    </View>
                    <View style={styles.input}>
                        <TextInput style={[styles.inputText, themeTextStyle]} value={password} onChangeText={ handlePassword } secureTextEntry={true} placeholder=" Password ... "  placeholderTextColor={'gray'} />
                        <View style={[styles.Indicator, pwdCheck.Indicator]}></View>
                    </View>
                </KeyboardAvoidingView>
                <Button title='Register' onPress={handleSubmit} />
            </View>
            
            <Button title="Login" onPress={()=>navigation.goBack()}  />

            { loading && <View style={styles.overlay}><LoadingIndicator/></View> }

            { click && ( <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => { isEditImage(false); }} /> )}
            
            { click && ( <ChangeImage onImageSelect={handleImageSelect} /> ) }
            
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
        alignItems: 'center',
        justifyContent:'center',
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
        padding:10
    },

    inputText: { 
        maxHeight: 40, 
        borderColor: 'gray',
        width:100,
        borderRadius:10, 
        marginRight:10,
        borderWidth: 1, 
        paddingLeft: 10,
        flexGrow:1,
      },

      Indicator: {
        // borderWidth: 1,
        padding:4,
        borderRadius:8,
      },
      profileContainer: {
        // borderWidth:1,
        // maxWidth:"100",
        alignItems: "center",
      },
      profileImage: {
        // flex:1,
        width: 100,
        height: 100,
        borderRadius: 50,
      },
      editIcon:{
           position: "absolute",
           bottom: 0,
           right: 50
      },
      closeIcon:{
        position:"absolute",
        fontSize: 20,
        bottom:0,
        zIndex: 2,
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

