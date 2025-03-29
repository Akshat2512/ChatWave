import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, TextInput, StyleSheet, FlatList,Text, TouchableOpacity, Modal, Button, ScrollView, Alert} from 'react-native';

// import Gif from 'react-native-gif';
import { Image, ImageErrorEventData } from 'expo-image';


import  { useWebSocket } from '@/context/WebsocketContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { ContactsStateProp } from '@/store/contactReducer';
import { ChatStateProp } from '@/store/chatReducer';

import { remFavGif, setFavGif, setGifsList } from '@/store/userAction';
import AddFavorite from './addtoFav';
import { StateMngProp } from '@/store/userReducer';

export default function giphy({setGif, setgifpage} : {setGif: any, setgifpage: any}) {
  console.log("Gifpage rerendered")
  const { themeTextStyle, themeContainerStyle } = useTheme();
  
  const sendMessage = useWebSocket().sendMessage;
  
  const gifs = useSelector((state: ContactsStateProp) => state.ContactUpdates.gifs);
  var favGifs = useSelector((state: ChatStateProp) => state.chatData.favGifs);
  var userName = useSelector((state: StateMngProp) => state.userData.userName);

  const dispatch = useDispatch();
//   const [gifs, setGifs] = useState<{
//       id: any; images: {original: {url: string}}
// }[]>([]);

  const [tab, setTab] = useState('Stickers');
  const [term, updateTerm] = useState('');


  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onEdit(newTerm:any) {
    updateTerm(newTerm);
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    
    intervalRef.current = setTimeout(() => {
    dispatch(setGifsList([]));
    sendMessage(`{"get":"search_gifs", "input":"${newTerm}", "format":"${tab}", "limit":"10", "offset":"0", "rating":"r", "bundle":"low_bandwidth"}`);
    },1000);
  }
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearImageCache();
    };
  }, []);

  const clearImageCache = async () => {
    try {
      await Image.clearMemoryCache();
      console.log('Image cache cleared successfully.');
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  };


    const handleGifPress = (item: any) => {
         
        setGif((prev: any) => [... prev, { id: prev.length, sender: userName, uri: item, font: null, transform: { "translateX": 0, "translateY": 0 , "rotate": `0rad`, "scale": 200, "flip": false } }]);

    }

  function handleTab(arg: string) {
        if (tab == arg)
            return;
        setTab(arg);  

        updateTerm('');
        if (arg == 'Emoji'){
            sendMessage(`{"get":"search_gifs", "input":"", "format":"${arg}", "limit":"10", "offset":"0", "rating":"r", "bundle":"low_bandwidth"}`);
          }  

        // setGif("null");
 
    }


  function AddorRemovefromFavorite(item: string){
  
    if (favGifs.includes(item))
    {
      favGifs = favGifs.filter(e=> e != item);
      dispatch(remFavGif(favGifs))
    }
    else{
      dispatch(setFavGif(item));
    }
      
  }

  function removefromFavorite(item: string){
    
    Alert.alert(
      "Remove From Favorite",
      `Do you want to remove gif from your favorites?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: () =>  AddorRemovefromFavorite(item)
        }
      ],
      { cancelable: true }
    );
  };
  
  



  function handleError(event: ImageErrorEventData): void {
     console.log(event.error);
  }

  return (

    <View style={[styles.view, themeContainerStyle]}>
     {/* <Ionicons name="arrow-back-outline" size={20} style={[{alignSelf: "flex-start", paddingVertical: 15}, themeTextStyle ]} onPress={()=> setgifpage(false)} /> */}
     <View style={styles.tabs}>
        <ScrollView style={styles.tabs}>
            <View style={styles.tabs}>
                <Button title='Favorites' color={tab == "Favorites" ? "gray" : ""} onPress = {()=>handleTab("Favorites")} />
                <Button title='Stickers' color={tab == "Stickers" ? "gray" : ""} onPress = {()=>handleTab("Stickers")} />
                <Button title='GIFs'   color={tab == "Gifs" ? "gray" : ""}  onPress = {()=>handleTab("Gifs")}     />
                <Button title='Emoji' color={tab == "Emoji" ? "gray" : ""}   onPress = {()=>handleTab("Emoji")}    />
            </View>
        </ScrollView>
    </View>
 
      { (tab == 'Gifs' || tab == 'Stickers' || tab == 'Emoji') && 
        <FlatList
        data={gifs}
        keyExtractor={(_, index) => index.toString()}
        horizontal={true}
        renderItem={({item}) => (
         <TouchableOpacity onPress={() => { handleGifPress(item); }} onLongPress={() => { AddorRemovefromFavorite(item); }} >
                                      <Image source={item} style={styles.image} placeholder={ require('@/assets/images/pendulum_icon-ezgif.com-resize.gif')}  contentFit='scale-down' allowDownscaling ={true} 
                                      onError = {handleError} 
                                      cachePolicy="disk"
                                      // cachePolicy={'none'}
                                      />
                                      {  favGifs.includes(item) && <View style={{position: "absolute", bottom: 0, right: 0}}>
                                     <AddFavorite item={item}></AddFavorite>
                                      </View>}
         </TouchableOpacity>
    
        )}
        contentContainerStyle={
          {
            // alignItems:"center",
            gap: 10
          }
        }
        // initialNumToRender={1}
        // maxToRenderPerBatch={1}

        removeClippedSubviews={true}
      />}

      {
        (tab == "Favorites") && 
        <FlatList
        data={favGifs}
        keyExtractor={(_, index) => index.toString()}
        horizontal={true}
        renderItem={({item}) => (
         <TouchableOpacity onPress={() => { handleGifPress(item); }} onLongPress={() => { removefromFavorite(item); }} >
                                      <Image source={{ uri: item }} style={styles.image} placeholder={ require('@/assets/images/pendulum_icon-ezgif.com-resize.gif')}  contentFit='scale-down' allowDownscaling ={true} 
                                      onError = {handleError} 
                                      cachePolicy={'disk'}
                                      // cachePolicy={'none'}6
                                      />
                                    
         </TouchableOpacity>
    
        )}
        contentContainerStyle={
          {
            alignItems:"center",
            gap: 10
          }
        }
        // initialNumToRender={1}
        // maxToRenderPerBatch={1}

        // removeClippedSubviews={true}
      />
      }
    { (tab == 'Gifs' || tab == 'Stickers') && 
     <TextInput
        placeholder= {`Search ${tab}`}
        placeholderTextColor='#fff'
        style={[styles.textInput, themeTextStyle]}
        value = {term}
        onChangeText={(text) => onEdit(text)}
        allowFontScaling={false}
    /> }
    </View>
  );
}

const styles = StyleSheet.create({
   
  view: {
    width: "100%",
    flex: 1,
    alignItems: 'center',
    // flexDirection: 'row',
    padding: 10,
    backgroundColor: 'grey',
    borderWidth: 10,
    borderColor: "transparent",
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // position: 'absolute',
    // bottom: 0,
  },
  tabs:{
    // flex: 1,
    // padding: 10,
    gap:10,
    flexDirection: 'row',
    height: 35,
    width: "100%",
    // overflow: 'scroll',
  },
  textInput: {
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: 'gray',
    backgroundColor: 'rgba(137, 137, 137, 0.2)',
    width: '100%',
    borderWidth: 1,
    height: 50,
    margin: 15
  },
  image: {
    width: 170,
    height: 150,
    // borderWidth: 3,
    marginBottom: 5
  },
});


