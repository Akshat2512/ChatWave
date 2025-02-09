import React, {useEffect, useRef, useState} from 'react';
import {View, TextInput, StyleSheet, FlatList, TouchableOpacity, Modal, Button, ScrollView} from 'react-native';

// import Gif from 'react-native-gif';
import { Image } from 'expo-image';

import  { useWebSocket } from '@/context/WebsocketContext';
import { Ionicons } from '@expo/vector-icons';
// do not forget to add fresco animation to build.gradle

export default function giphy({setGif, setgifpage} : {setGif: any, setgifpage: any}) {

  const {sendMessage, recvGifs} = useWebSocket();
//   const [gifs, setGifs] = useState<{
//       id: any; images: {original: {url: string}}
// }[]>([]);

  const [tab, setTab] = useState('Stickers');
  const [term, updateTerm] = useState('');

  const [recentGifs, setRecentGifs] = useState([]);

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onEdit(newTerm:any) {
    updateTerm(newTerm);
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    intervalRef.current = setTimeout(() => {
    sendMessage(`{"get":"search_gifs", "input":"${newTerm}", "format":"${tab}", "limit":"10", "offset":"0", "rating":"r", "bundle":"low_bandwidth"}`);
    },1000);
  }
  
  useEffect(()=>{
    console.log(recentGifs)
  }, [recvGifs])
  
    function handleGifPress(item: any) {
         
        setGif((prev: any) => [... prev, { id: prev.length, uri: item, font: null, transform: { "translateX": 0, "translateY": 0 , "rotate": `0rad`, "scale": 200, "flip": false } }]);

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

  return (

    <View style={styles.view}>
     <Ionicons name="arrow-back-outline" size={20} style={styles.textInput} onPress={()=> setgifpage(false)} />
     <View style={styles.tabs}>
        <ScrollView style={styles.tabs}>
            <View style={styles.tabs}>
                <Button title='Recents' onPress = {()=>handleTab("Recent")}/>
                <Button title='Stickers' onPress = {()=>handleTab("Stickers")} />
                <Button title='GIFs' onPress = {()=>handleTab("Gifs")} />
                <Button title='Emoji' onPress = {()=>handleTab("Emoji")} />
            </View>
        </ScrollView>
    </View>
   { (tab == 'Gifs' || tab == 'Stickers') && <TextInput
        placeholder= {`Search ${tab}`}
        placeholderTextColor='#fff'
        style={styles.textInput}
        value = {term}
        onChangeText={(text) => onEdit(text)}
    /> }
      { (tab == 'Gifs' || tab == 'Stickers') && <FlatList
        data={recvGifs.gifs}
        keyExtractor={(_, index) => index.toString()}
        horizontal={true}
        renderItem={({item}) => (
         <TouchableOpacity onPress={() => { handleGifPress(item); }}>
                <Image source={{ uri: item }} style={styles.image} contentFit='contain' />
         </TouchableOpacity>
    
        )}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        removeClippedSubviews={true}
      />}
    
    </View>
  );
}

const styles = StyleSheet.create({
   
  view: {
    // height: "90%",
    width: "100%",
    flex: 1,
    alignItems: 'center',
    // flexDirection: 'row',
    padding: 10,
    backgroundColor: 'grey',
    borderWidth: 10,
    borderColor: "transparent",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
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
    width: '100%',
    height: 50,
    color: 'white'
  },
  image: {
    width: 200,
    height: 150,
    // borderWidth: 3,
    marginBottom: 5
  },
});


