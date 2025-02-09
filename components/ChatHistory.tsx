import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ImageSourcePropType, useWindowDimensions, KeyboardAvoidingView, Platform, Button, Keyboard, Modal, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import BubbleMessage from './BubbleMessage';
import { Image } from 'expo-image';

// import * as SplashScreen from 'expo-splash-screen';

import GIFpage from './GIFpage';
import DraggableImage from './draggableContainer';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStorage from '@/hooks/useStorage';
// import GiphyDialog from 'react-native-giphy';
 
interface ChatMessage {
  id: string;
  sender: {
    name: string;
    profileImage: ImageSourcePropType;
  };
  recipient: {
    name: string;
    profileImage: ImageSourcePropType;
  };
  message: string;
  timestamp: string;
}

interface ChatHistoryProps {
  uname: string;
  messages: ChatMessage[];
  onLoad: any
}

interface gifProps{
  translateX: number ;
  translateY: number ;
  rotate: string;
  scale: number;
  flip: boolean;
}

interface fontProp{
  text: string;
  bgColor: string;
  fontFamily: string;
  color: string;
  size: number; 
}


const ChatHistory: React.FC<ChatHistoryProps> = ({ uname, messages, onLoad }) => {
  const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();
  const storage = useStorage();
  // const themeTextStyle = colorMode === 'dark' ? Colors.darkThemeText : Colors.lightThemeText;
  // const themeContainerStyle = colorMode === 'dark' ? Colors.darkContainer : Colors.lightContainer;
  const [isGifPickerVisible, setIsGifPickerVisible] = useState(false);
  
  const selected_gifs: {id: number, uri: string | null, font: fontProp | null, transform: gifProps}[] | [] = [];
  
  const [selectedGif, setSelectedGif] = useState(selected_gifs);
  
  const [transformGif, setTransformgif] = useState(false);
  
  const [textStyles, setTextStyles] = useState(false);
 
  // useEffect(() => {
  //   // Simulate loading process
  //   setTimeout(() => {
  //     onLoad();
  //   }, 3000); // Adjust the timeout based on your actual loading time
  // }, []);

  const conversation = [
    { "name": "Sender", "message": "Hey there! How are you doing today?" },
    { "name": "You", "message": "I'm doing great, thanks! How about you?" },
    { "name": "Sender", "message": "I'm good as well. Have you started working on that project?" },
    { "name": "You", "message": "Yes, I just began this morning. There's a lot to do!" },
    { "name": "Sender", "message": "I can imagine. Need any help with it?" },
    { "name": "You", "message": "Thanks, I might take you up on that! I'll let you know if I get stuck." },
    { "name": "Sender", "message": "No problem. Just give me a shout anytime." },
    { "name": "You", "message": "Will do! What are you up to today?" },
    { "name": "Sender", "message": "Just catching up on some reading. Have you read any good books lately?" },
    { "name": "You", "message": "Not recently, but I'm looking for recommendations. Got any?" },
    { "name": "Sender", "message": "Absolutely. You should check out 'Sapiens' by Yuval Noah Harari. It's fascinating." },
    { "name": "You", "message": "Sounds interesting! I'll add it to my list." },
    { "name": "Sender", "message": "Hey there! How are you doing today?" },
    { "name": "You", "message": "I'm doing great, thanks! How about you?" },
    { "name": "Sender", "message": "I'm good as well. Have you started working on that project?" },
    { "name": "You", "message": "Yes, I just began this morning. There's a lot to do!" },
    { "name": "Sender", "message": "I can imagine. Need any help with it?" },
    { "name": "You", "message": "Thanks, I might take you up on that! I'll let you know if I get stuck." },
    { "name": "Sender", "message": "No problem. Just give me a shout anytime." },
    { "name": "You", "message": "Will do! What are you up to today?" },
    { "name": "Sender", "message": "Just catching up on some reading. Have you read any good books lately?" },
    { "name": "You", "message": "Not recently, but I'm looking for recommendations. Got any?" },
    { "name": "Sender", "message": "Absolutely. You should check out 'Sapiens' by Yuval Noah Harari. It's fascinating." },
    { "name": "You", "message": "Sounds interesting! I'll add it to my list." },
    // { "name" : "Sender", "gif_msg": { uri: selectedGif} },
    // { "name" : "You", "gif_msg": { uri :selectedGif }}
  ];
  

  const fontStyles = [
    {fontFamily: 'cbvgfg', fontSize: 20},
    {fontFamily: 'SpaceMono', fontSize: 20},
    {fontFamily: 'BonheurRoyal', fontSize: 30},
    {fontFamily: 'Flavour', fontSize: 25},
    {fontFamily: 'Nosifier', fontSize: 15},
    {fontFamily: 'EaterRegular', fontSize: 15},
    {fontFamily: 'Charmonman', fontSize: 20},
    {fontFamily: 'LavishlyYours', fontSize: 30},
    {fontFamily: 'Neonderthaw', fontSize: 30},
    {fontFamily: 'PuppiesPlay', fontSize: 35},
    {fontFamily: 'Nunito', fontSize: 20},
    {fontFamily: 'Oswald', fontSize: 18},
    {fontFamily: 'Roboto', fontSize: 15},    
    {fontFamily: 'Nabla', fontSize: 20},
    {fontFamily: 'Convergence', fontSize: 18},
  ];

 
  const fontBgColor = [
    { "backgroundColor": "rgb(255, 255, 255)", "color": "black" },
    { "backgroundColor": "rgb(113, 111, 111)", "color": "black" },
    { "backgroundColor": "rgb(0,0,0)", "color": "white" },
    { "backgroundColor": "rgb(217, 109, 37)", "color": "black" },
    { "backgroundColor": "rgb(223, 163, 123)", "color": "black" },
    { "backgroundColor": "rgb(239, 39, 39)", "color": "white" },
    { "backgroundColor": "rgb(239, 39, 39)", "color": "white" },
    { "backgroundColor": "rgb(232, 92, 204)", "color": "white" },
    { "backgroundColor": "rgb(222, 145, 207)", "color": "black" },
    { "backgroundColor": "rgb(132, 92, 232)", "color": "white" },


  ]

  
  
  //   if (!loaded) {
  //     return null;
  //   }

  useEffect(() => {
    //  if(selectedGif.length == 0){
      setIsGifPickerVisible(false);
      Keyboard.dismiss();
    //  }
      console.log(selectedGif);
    
  },[selectedGif]);


  // const [text, setText] = useState('');
  const inputText = useRef({text:'' , bgColor: 'transparent', fontFamily: 'SpaceMono', color: 'white', size: 15});

  const inputRef = useRef<TextInput>(null);

  const handleGetText = (text: string) => {
    if(inputText.current !== null) {
       inputText.current.text = text;
    console.log('Input Text:', text);
    }
  
  };

  const isFocused = useRef(false);
  // const [inputVisible, setInputVisible] = useState(true);
  // const [keyboardVisible, setKeyboardVisible] = useState(false); 
  

  let maxTranslateY = useRef(0);
  
  // useEffect(()=>{
  //   console.log(viewHeight + maxTranslateY.current);
  // }, [maxTranslateY.current])
  
  const [chats, setChat] = useState<{id: number, uri: string, font: fontProp, transform: gifProps}[] | []>([]);

  const sendGifs = async () => {     
 
      var len = chats.length; 
      var sel: {
        id: number;
        uri: string | null;
        font: fontProp | null;
        transform: gifProps;
    }[] = [];

      selectedGif.forEach(e=>{
        if(Object.keys(e).length==0)
          return;
        if(e.transform.translateY > maxTranslateY.current){
          maxTranslateY.current = e.transform.translateY;
        }

        if(e.id>=0)  
        {
        e.id = len;
        len = len + 1;
        sel.push(e); 
        }  

      })
     
      setChat((prev: any) =>  [ ... sel, ... prev]);
      setSelectedGif([])
      setIsGifPickerVisible(false);
      
  };

  
  const [viewHeight, setheight] = useState(0);

  const [keyboardheight,setkeyboardheight] = useState(0);
  
  const viewRef = useRef<View | null>(null);

    const handleLayout = () => {
      if (viewRef.current) {
        viewRef.current.measure(async (x: any, y: any, width: any, height: any) => {
          
          // storage.removeItem('@viewHeight');

          const val = await storage.getItem('@viewHeight');
          console.log( width, height, val );
 
          if(val == null){
            storage.setItem('@viewHeight', String(height));
          }
 
          if(val != null){
           setheight(Number(val));
          }
          
          // const fontstyle: string | null = await storage.getItem(`${uname}@font`)
          const fontcolor: string | null = await storage.getItem(`${uname}@fontColor`);
          const fontfamily: string | null = await storage.getItem(`${uname}@fontFamily`);
          console.log(fontcolor, fontfamily);

          if(fontcolor || fontfamily){
            var clr = fontcolor ? JSON.parse(fontcolor) : null;
            var fam = fontfamily ? JSON.parse(fontfamily) : null;
            inputText.current.bgColor = clr.backgroundColor;
            inputText.current.color = clr.backgroundColor == 'transparent' ? themeTextStyle.color: clr.color ;
            inputText.current.fontFamily = fam.fontFamily;
            inputText.current.size = fam.fontSize;
            
          }
          
          console.log(selectedGif.length);
        });
      }
    };

  const flatListRef = useRef<FlatList>(null);

  async function retrieveMessages(){
    const msg = await storage.getItem(`${uname}@messages`);
    console.log(msg)
    if(msg){
      const parsed_msg = JSON.parse(msg);

       if(parsed_msg.length>0){
            maxTranslateY.current = parsed_msg.reduce((max: number, item: any) => {
              return item.transform.translateY > max ? item.transform.translateY : max;
            }, -Infinity);

           console.log(parsed_msg);
           setTimeout(()=>{
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({ offset: maxTranslateY.current - 200, animated: true });
            }
           }, 1000)
           console.log("current: "+ maxTranslateY.current)
      setChat(parsed_msg);
    }
    }
  }
   
  useEffect(() => {
    // This will run once when the component mounts
    retrieveMessages();        
   
    setTimeout(()=>{ handleLayout(); onLoad();},200)
  }, []);

  useEffect(()=>{
    if(chats){
    storage.setItem(`${uname}@messages`, JSON.stringify(chats));  
    }
    console.log(chats);
  }, [chats])

  useEffect(() => {
      const keyboardHide = Keyboard.addListener('keyboardDidHide', (event) => {
        //  setIsFocused(false); 
         isFocused.current = false;     
         console.log(event.endCoordinates.height);
         setkeyboardheight(event.endCoordinates.height);

      })
      const keyboardShow = Keyboard.addListener('keyboardDidShow', (event) => {
        // setIsFocused(true);     
        setTextStyles(false);
        isFocused.current = true;     
        
        console.log(event.endCoordinates.height);
        setkeyboardheight(event.endCoordinates.height);
      
     })
     return () => {
      keyboardShow.remove();
      keyboardHide.remove();
     }
    }, []);
    

  // const { height } = useWindowDimensions();

  const handleText = ()=>{
        // setTransformgif((prev: any)=> prev ? false : true)
        if(inputText.current.text != '')
          setSelectedGif((prev: any) =>  [... prev, { id: prev.length, uri:null, font: { text: inputText.current.text, bgColor: inputText.current.bgColor, fontFamily: inputText.current.fontFamily, color: inputText.current.color, size: inputText.current.size }, transform: { "translateX": 0, "translateY": 0 , "rotate": `0rad`, "scale": 200} }]);

        inputText.current.text = '';
        inputRef.current?.clear();
      }

  const [scrollY, setScrollY] = useState(0);
  // const scrollY = useRef(0);

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    event.persist();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setTimeout(() => {
      setScrollY(event.nativeEvent.contentOffset.y);
      }, 
      50);
    // scrollY.current = event.nativeEvent.contentOffset.y;
  }

  

  function updateFontFamily(item: { fontFamily: string; fontSize: number }) {
    //  storage.removeItem(`${uname}@fontFamily`);
    //  storage.removeItem(`${uname}@fontColor`);
     storage.setItem(`${uname}@fontFamily`, JSON.stringify(item));
     inputText.current.fontFamily = item.fontFamily;
     inputText.current.size = item.fontSize;

  }
 
  

  function updateFontColor(item: { color: string; backgroundColor: string }) {
    //  storage.removeItem(`${uname}@fontFamily`);
    //  storage.removeItem(`${uname}@fontColor`);
     storage.setItem(`${uname}@fontColor`, JSON.stringify(item));
     inputText.current.bgColor = item.backgroundColor;
     inputText.current.color = item.color;
  }
  

  return (
    
      <>
      <View style={[styles.container, themeContainerStyle]} ref={viewRef} >
        <View style={[styles.msgContainer]}>
          { chats.length!=0 && 
          <FlatList
          ref = {flatListRef}
          data={chats}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            item.transform ? <View style={[styles.adjustImg, {
                                      top: item.transform.translateY + 20 + 0.1, 
                                      left: item.transform.translateX + 20 + 0.1, 
                                      width:  item.transform.scale, 
                                      height: item.transform.scale, 
                                      // width: 200,
                                      // height: 200,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      // borderWidth:3,
                                      zIndex: item.id,
                                      borderRadius: 20,
                                      padding:20,
                                      // borderColor: "rgb(10, 235, 255)",
                                      transform: [
                                        {rotate: item.transform.rotate }, 
                                        {scaleX: item.transform.flip ? -1 : 1},  
                                    
                                          // {scale: item.font ? item.transform.scale/200 : 1}
              
                                    
                                      ] 
                                      }]}>
                       { item.uri && <Image source={{uri: item.uri}} 
                                      contentFit="contain"
                                      style = {styles.image}
                                     />}
                       {item.font && <View style={{
                            // borderWidth: 3, 
                            padding: 12,
                            // borderColor:"rgb(10, 235, 255)",
                            // position: 'absolute',
                            
                            justifyContent: 'center',
                            alignItems: 'center',
                           
                       }}>
                       <Text style =
                        {{color: item.font.color,
                          position: 'absolute',
                          // top: '50%',
                          // left: '50%',
                          // borderWidth: 3, 

                            // borderColor:"rgb(10, 235, 255)",
                          backgroundColor:item.font.bgColor, 
                          fontFamily: item.font.fontFamily, 
                          fontSize: item.font.size, 
                          padding: 5, 
                          // width: item.transform.scale,
                          borderRadius: 10, 
                          boxShadow: item.font.bgColor == 'transparent' ? '' : '0 2px 4px rgba(0, 0, 0, 0.46)', 
                          transform: [
                            {scale: item.font ? item.transform.scale/200 : 1}                        
                          ] 
                        }}>{item.font.text}</Text></View>
                         }
                       </View> : null
          )}
       
          contentContainerStyle={{
            // paddingHorizontal: 10,
            // gap: 10,
            // borderWidth:2,
            width:"100%",
            height:  viewHeight  +  maxTranslateY.current + 700,
            // height: "20%",
            // position: 'absolute',
            // overflow: 'scroll',
          }}
          onScroll={handleScroll}
          initialNumToRender={10} // Number of items to render initially
          // windowSize={10} // Number of items to keep in memory outside of the viewport
          // onEndReached={handleLoadMore}
          // onEndReachedThreshold={0.5}
          // automaticallyAdjustKeyboardInsets
          />}
         
           {/* {gif.map((item, index) =>
                  item.uri ? (
                    <Image
                      // key={index.toString()}
                      source={{ uri: item.uri }}
                      contentFit="contain"
                      style={[styles.image, { top: item.translateY, left: item.translateX }]}
                    />
                  ) : null
                )} */}
        </View>
        {(selectedGif.length>0 && !isFocused.current && !textStyles) && ( <View style={styles.sendgifs}>
                <View style={{position: "absolute", flexDirection: "row", bottom: 0, gap:10}}>
                    <Button title="Send" onPress={sendGifs} />
                    <Button title="Cancel" color={'red'} onPress={()=>setSelectedGif([])} />
               </View>
            </View>) }
        {/* <FlatList
          data={conversation}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <BubbleMessage name={item.name} message={item.message ?? ''} />}
          contentContainerStyle={{
            paddingHorizontal: 10,
            gap: 10,
            zIndex:0
          }}
           />  */}
        {  <View style={styles.draggable}>
         
         {selectedGif.map((item, index) => (
             item.transform &&
                <DraggableImage 
                  key={index.toString()} 
                  id={index} 
                  imageSize={200} 
                  uri={item.uri} 
                  font={item.font} 
                  setgif={setSelectedGif} 
                  scrollY={scrollY}
                  kheight={keyboardheight} />  
          ))}
         </View> }
      </View>
    
      
      <KeyboardAvoidingView
      // keyboardVerticalOffset={600}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[ styles.inputContainer, themeContainerStyle ]}>
        <TextInput style={[ 
            styles.inputText, 
            themeTextStyle, 
            {fontFamily: inputText.current.fontFamily, 
             color: inputText.current.color,
             fontSize: inputText.current.size,
             backgroundColor: inputText.current.bgColor}
            ]}
          placeholder="Type here..."
          placeholderTextColor={inputText.current.color}
          ref={inputRef}
          onChangeText={handleGetText}
          editable={true}
          returnKeyType="send"
          multiline={true}
          onFocus={() => isFocused.current = true}
          onBlur={() => isFocused.current = false} />
        
        {(isFocused.current) 
          ? ( <View style={{ alignSelf: "flex-start", paddingVertical: 18  }}>
                 <Text onPress={handleText} style={{color: "white", backgroundColor: "rgb(24, 110, 208)", paddingVertical: 8, paddingHorizontal:10, borderRadius: 8}}>Select</Text>
            </View>)
          : (<View style={[styles.inputIcons]}>
              <Ionicons name="camera-outline" size={30} color={colorMode === 'dark' ? "white" : "black"} />
              {/* <Ionicons name="document-outline" size={30} color={colorMode === 'dark' ? "white" : "black"} /> */}
              <TouchableOpacity>
                <Text style={{fontSize: 30, 
                            borderRadius: 10,
                            color: colorMode === 'dark' ? "white" : "black", 
                            backgroundColor: textStyles ? 'gray' : 'transparent'
                            }} onPress={()=>{setTextStyles(!textStyles);}}> Aa </Text></TouchableOpacity>
              <Ionicons name="happy-outline" size={30} color={colorMode === 'dark' ? "white" : "black"} onPress={()=>{setIsGifPickerVisible(true)}}/>
             </View>)} 
        </View>
 
        { textStyles && (<><FlatList
          data={fontBgColor}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {updateFontColor(item)}}>

               <Text style={[styles.fontList,{
                             color: item.color, 
                             backgroundColor: item.backgroundColor, 
                             borderColor: inputText.current.bgColor === item.backgroundColor ? "rgb(24, 110, 208)" : "transparent"
                            } ]}> Aa </Text>
              </TouchableOpacity>
              // console.log(item.backgroundColor)
          )}
          horizontal={true}
                             
          ListHeaderComponent={<TouchableOpacity 
                               style={[styles.fontList, 
                                  { borderColor: inputText.current.bgColor === 'transparent' ? "rgb(24, 110, 208)" : "transparent"}]}>
                                <Ionicons name="ban" size={30} color={colorMode === 'dark' ? "white" : "black"}  
                                 onPress = {() => updateFontColor({backgroundColor: 'transparent', color: themeTextStyle.color})} />
                              </TouchableOpacity>}
          contentContainerStyle={{
            // paddingHorizontal: 10,
            gap: 50,
            height: 90,
            alignItems: 'center',
            backgroundColor: themeContainerStyle.backgroundColor,
            padding: 20,
          }}
          automaticallyAdjustKeyboardInsets
          />
          
          <FlatList
          data={fontStyles}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {updateFontFamily(item)}}>
               <Text style={{
                            color: themeTextStyle.color, 
                            //  backgroundColor: item.backgroundColor, 
                            fontFamily: item.fontFamily,
                            //  height: 40, 
                            //  width: 40,
                            fontSize: item.fontSize, 
                            // padding: 3,
                             textAlign: 'center', 
                             textAlignVertical: 'center',
                             borderRadius: 10,
                             borderWidth:2,
                             borderColor: item.fontFamily == inputText.current.fontFamily ? "rgb(123, 159, 200)" : 'transparent',
                            }}> Font </Text>
            </TouchableOpacity>
              // console.log(item.backgroundColor)
          )}
          horizontal={true}
          contentContainerStyle={{
            // paddingHorizontal: 10,
            gap: 50,
            height: 90,
            alignItems: 'center',
            backgroundColor: themeContainerStyle.backgroundColor,
            padding: 20,
          }}
          automaticallyAdjustKeyboardInsets
          /></>)
         }

         { isGifPickerVisible && <Modal animationType='slide' transparent={true} onRequestClose={() => setIsGifPickerVisible(false)}>
                                      <GIFpage setGif = {setSelectedGif} setgifpage={setIsGifPickerVisible} />
                                 </Modal> }


      </KeyboardAvoidingView>
    
                 
      </>

  );
};

const styles = StyleSheet.create({

  container: {
    flex:1,
    margin: 0,
    padding: 0,
    // zIndex: 0,
    // borderWidth:1,
    // height:"100%"
    // paddingHorizontal: 10,
    // justifyContent:"flex-end",
  //  flexGrow:1,
  },
  draggable:{
      // flex: 1,
      height:"0%",
      width:"0%",
      zIndex:0,
      position: 'absolute', 
      left:0,
      top:0,
      backgroundColor: 'rgba(114, 111, 111, 0.1)',
      // overflow: 'visible',
      // right:"50%",
      // justifyContent: 'center',
      // alignItems: 'center',
  },
  sendgifs:{
    flex: 1,
    alignItems:"center",
    position:"absolute",
    bottom:0,
    left:"50%",
    zIndex:1
  },

  inputContainer: { 
    // flex: 1, 
    // borderWidth:1,
    zIndex:1,
    flexDirection:'row',
    alignItems: 'center',
    // flexGrow: 1, 
    paddingHorizontal: 20, 
    paddingVertical:10,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.46)',

  }, 
  inputText: { 
    // flex:1,
    maxHeight: 140, 
    borderColor: 'gray',
    // textAlignVertical: 'center',
    borderRadius:10, 
    marginRight:10,
    borderWidth: 1, 
    padding: 10,
    flexGrow:1,
    // flexDirection:'row',  
  },
  inputIcons:{
    flexDirection:"row",
    alignSelf: "flex-start"
  },

  msgContainer:{
  //  flex:1,
  //  width:"100%",
  //  height:12000,
  //  borderWidth: 3,
  //  overflow: "scroll",
   position: 'relative',
  //  top: 5,

  },

  adjustImg:{
    position: "absolute",
    // padding:20,
    borderWidth:3,
    borderColor:"transparent",
  },

  image: {
    width: "100%",
    height: "100%",
    zIndex:0
  },

  fontList:{
    height: 40, 
    width: 40, 
    textAlign: 'center', 
    textAlignVertical: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth:2,
    borderColor: "transparent",
  },
  imageContainer: {
    // justifyContent: 'center',
    // alignItems: 'center',
    position: 'absolute',
    // borderWidth:3,
    borderRadius: 20,
    padding:20
    
    // bottom:0,
  },
});

export default ChatHistory;