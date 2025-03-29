import React, { useEffect, useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useWebSocket } from '@/context/WebsocketContext';
import LoadingIndicator from './ActivityIndicator';


export default function ChangeImage({ onImageSelect } : any) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  // const [imageInfo, setImageInfo] = useState({ width: 0, height: 0 });


  const {sendMessage} = useWebSocket();

  const { colorMode } = useTheme();
 
  const themeTextStyle = colorMode === 'dark' ? Colors.darkThemeText : Colors.lightThemeText;
  const themeContainerStyle = colorMode === 'dark' ? Colors.darkContainer : Colors.lightContainer;
  const [loading, indicatorVisible] = useState(false);
  
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    indicatorVisible(true);
    const result = await ImagePicker.launchCameraAsync(
      {quality: 0.5,
      base64: true,
      exif: true}
    );
    indicatorVisible(false);

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      // setImageInfo({ width: result.assets[0].width, height: result.assets[0].height });
    }
  };

  const openImageLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    indicatorVisible(true);
    const result = await ImagePicker.launchImageLibraryAsync(
      {quality: 0.5,
       allowsEditing: true,
      //  aspect: [4, 3],
       base64: true,
       exif: true}
    );
    indicatorVisible(false);

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      // setImageInfo({ width: result.assets[0].width, height: result.assets[0].height });
      // console.log(result);
    }
  };

  function setProfileImage() {
    onImageSelect(selectedImage);   
  }

  return (
    <View style={[styles.container, themeContainerStyle]}> 
     
      <View>
        <Image source={selectedImage ? { uri: selectedImage.uri } : require("@/assets/profiles/images/default.png")} style={styles.image} />
        <View style={styles.icon}>
          <Ionicons size={30} name="checkmark" style={{flex:1, color: "darkgreen", textAlign: "center"}} onPress = {()=>{ setProfileImage() }}/>
          <Ionicons size={30} name="close" style={{flex:1, color: "darkred", textAlign: "center"}} onPress = {()=>{ setSelectedImage(null) }}/>
        </View>
       </View>
      
      <View style={styles.select}>
        <Button title="Open Camera" onPress={openCamera} />
        <Button title="Open Image Library" onPress={openImageLibrary} />
      </View>
      { loading && <View style={styles.overlay}><LoadingIndicator /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: "100%",
    // height: 300,
    overflow:"hidden",
    backgroundColor:"gray",
    position:"absolute",
    bottom: 0,
    gap:20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf:"center",
    transitionTimingFunction: "ease",
    zIndex:1,
    borderTopStartRadius:10,
    borderTopEndRadius:10,
    padding: 30,
  },
  select:{
  //  flex: 1,
  // alignItems: "center",
  justifyContent:"center",
   flexDirection:"row",
   gap:10,
    
  },

  icon:{
    justifyContent:"center",
    alignItems: "center",
    flexDirection:"row",
    gap:10,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
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
