import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ImageSourcePropType, useWindowDimensions, KeyboardAvoidingView, Platform, Button, Keyboard, Modal, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
// import * as SplashScreen from 'expo-splash-screen';

import GIFpage from './GIFpage';
import DraggableImage from './draggableContainer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatListProp } from '@/interfaces/ChatInterface';
import { useDispatch, useSelector } from 'react-redux';
import { StateMngProp } from '@/store/userReducer';
import { setBotState, setChatStorage, setFontStyle } from '@/store/userAction';
import ChatMessage from './ChatMessage';
import { ChatStateProp } from '@/store/chatReducer';

import { Image } from 'expo-image'; 
import { useWebSocket } from '@/context/WebsocketContext';
import { ContactsStateProp } from '@/store/contactReducer';
import AutoCompletion from './AutoCompletion';
import { animated_bot } from '@/components/BotAnimation';

// interface ChatMessage {
//   id: string;
//   sender: {
//     name: string;
//     profileImage: ImageSourcePropType;
//   };
//   recipient: {
//     name: string;
//     profileImage: ImageSourcePropType;
//   };
//   message: string;
//   timestamp: string;
// }

interface ChatHistoryProps {
  uname: string;
  visible: React.Dispatch<React.SetStateAction<number>>
}



  const fontFamily = [
    {fontFamily: 'GoogleSans', fontSize: 15},
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
    { "backgroundColor": "rgb(73, 162, 187)", "color": "black" },
    { "backgroundColor": "rgb(223, 163, 123)", "color": "black" },
    { "backgroundColor": "rgb(187, 211, 30)", "color": "black" },
    { "backgroundColor": "rgb(227, 102, 102)", "color": "white" },
    { "backgroundColor": "rgb(232, 92, 204)", "color": "white" },
    { "backgroundColor": "rgb(222, 145, 207)", "color": "black" },
    { "backgroundColor": "rgb(132, 92, 232)", "color": "white" },

  ]




const ChatView: React.FC<ChatHistoryProps> = ({ uname, visible}) => {

  // console.log("ChatView Rendered");

  const { colorMode, themeTextStyle, themeContainerStyle } = useTheme();

  const [isGifPickerVisible, setIsGifPickerVisible] = useState(false);
  
  const selected_gifs: ChatListProp[] | [] = [];
  
  var [selectedGif, setSelectedGif] = useState(selected_gifs);
  
  const [transformGif, setTransformgif] = useState(false);
  
  const [textStyles, setTextStyles] = useState(false);

  const {sendMessage} = useWebSocket();
  


  const sel_gifs = useRef<ChatListProp[]>([]);


  useEffect(() => {

      setIsGifPickerVisible(false);
      Keyboard.dismiss();
      // console.log(selectedGif);
    
  },[selectedGif]);


  const [isFocused, setIsFocused ] = useState(false);

  const maxTranslateY = useRef(0);
  const ScrollPaginate = useRef(0);

  const scrollY = useRef(0);

  const userName = useSelector((state : StateMngProp) => state.userData.userName);
  const msg_que = useSelector((state: ChatStateProp) => state.chatData.msg_que);
  const fontStylesAndLayout = useSelector((state: ChatStateProp) => state.chatData.fontStylesAndLayout);
  // const favGifs  = useSelector((state: ChatStateProp) => state.chatData.favGifs);
  const chats = useSelector((state: ChatStateProp) => state.chatData.chats[uname])
  const dispatch = useDispatch();

  const sendTofriend =  () => {     
    
      // console.log(chats)
 
      var sel: ChatListProp[] = [];

      selectedGif.forEach(e=>{
        if(Object.keys(e).length==0)
          return;
      
        if(e.id>=0)  
        {
          e.transform.translateY = scrollY.current + e.transform.translateY;
          // console.log(scrollY.current)
          sel.unshift(e); 
        } 
        
        if(e.transform.translateY > maxTranslateY.current){
          maxTranslateY.current = e.transform.translateY;
        }
      })

      sel_gifs.current = sel; 
      
      sendMessage(JSON.stringify({send: "Message", to:uname, chats: setChatStorage(uname, sel, maxTranslateY.current).payload.chats}));
      setSelectedGif([])
      // setChat((prev: any) =>  [ ... sel, ... prev]);
      setIsGifPickerVisible(false);
      
  };

  useEffect(()=>{
    // paginationRerendering(scrollY);
     paginationRerendering();
     maxTranslateY.current = fontStylesAndLayout[uname].maxTranslateY;
     if(scrollY.current > maxTranslateY.current-250){
      setScrollToBottom(false);
    }
    else{
      setScrollToBottom(true);
    }
    //  console.log("Page: ", chats)
  }, [chats])

  useEffect(()=>{
    // console.log(msg_que)
    if(msg_que[uname]){
        const que = msg_que[uname].reverse()
      sel_gifs.current.forEach((e,index)=>{
      if(e.id>=0){
        e.id = que[index];
        e.time = chats.updated_on;
      }
    })
    // console.log(selectedGif)
    dispatch(setChatStorage(uname, sel_gifs.current , maxTranslateY.current))
    delete msg_que[uname]
    }
  
  }, [msg_que])

  
  
  const viewRef = useRef<View | null>(null);

  const handleLayout =  () => {
        
         console.log(fontStylesAndLayout);
         if(!(uname in fontStylesAndLayout))
           dispatch(setFontStyle(uname, {fontBgColor: "transparent", fontColor: "", fontFamily:"SpaceMono", fontSize: 15, maxTranslateY: maxTranslateY.current}));
        
        //  console.log(fontStylesAndLayout[uname]);
           
          if(uname in fontStylesAndLayout){
          setTimeout(()=>{
            scrollToLastMessage(false);
            botState == 'sleep' ? SleepBot() : WakeupBot()
            visible(1)
         }, 1000)
           maxTranslateY.current = fontStylesAndLayout[uname].maxTranslateY;
           ScrollPaginate.current = maxTranslateY.current - 2000 ;
            paginationRerendering();
      };
      
    };

  function scrollToLastMessage(animated: boolean){
    if (ScrollViewRef.current) {
      ScrollViewRef.current.scrollTo({ y: fontStylesAndLayout[uname].maxTranslateY - 200, animated: animated});            
      
    }
  }

  const ScrollViewRef = useRef<ScrollView>(null);

   
  useEffect(() => {

     handleLayout();

     return () => {
      clearImageCache();
     }
  }, []);

  const clearImageCache = async () => {
    try {
      await Image.clearMemoryCache();
      // await Image.clearDiskCache();
      console.log('Image cache cleared successfully.');
    } 
    catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  };
  

  useEffect(() => {
      const keyboardHide = Keyboard.addListener('keyboardDidHide', (event) => {
        //  setIsFocused(false); 
         setIsFocused(false);     

      })
      const keyboardShow = Keyboard.addListener('keyboardDidShow', (event) => {
        setIsFocused(true);     
        setTextStyles(false);
        // setIsGifPickerVisible(false);
        // isFocused.current = true;     
      
     })
     return () => {
      keyboardShow.remove();
      keyboardHide.remove();
      setChatLists([])
      sel_gifs.current = [];
      Terminate_Stream();
      visible(0);
     }
    }, []);
    

  // const { height } = useWindowDimensions();
 const [scrollToBottom, setScrollToBottom] = useState(false);


 function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {

    scrollY.current = (event.nativeEvent.contentOffset.y);
    // console.log(scrollY, maxTranslateY.current-200)
      if(scrollY.current > maxTranslateY.current-250){
        setScrollToBottom(false);
      }
      else{
        setScrollToBottom(true);
      }

      if(scrollY.current < ScrollPaginate.current + 1000 ){  
        ScrollPaginate.current = ScrollPaginate.current - 2000 
        paginationRerendering() 
        // console.log("Scroll up")
      }
      else if(scrollY.current > ScrollPaginate.current + 2000 + 1000){
        ScrollPaginate.current = ScrollPaginate.current + 2000 ;
        paginationRerendering() 
        // console.log("Scroll down")

      }
    // paginationRerendering()

}

function paginationRerendering(){
  // if (uname in chats)
  { 
    const { newLists }  = chats.Messages.reduce<{newLists:ChatListProp[]}>((acc, e) => { 
      if (e.transform.translateY > ScrollPaginate.current) {
        acc.newLists.push(e);
      }
      // if(e.uri && e.transform.translateY > scrollY.current && e.transform.translateY < scrollY.current + 700)
      //   acc.newLists.push(e);
      return acc;
    }, {newLists: []});
  
    // const newLists = chats.Messages.filter(e =>
    //    e.transform.translateY > ScrollPaginate.current 
    //   //  && e.transform.translateY < ScrollPaginate.current + 2800
    //  )
   setChatLists(newLists)

  }
}




  const textInput = useRef('');
   

  const inputRef = useRef<TextInput>(null);
 

  const handleGetText = (text: string) => {
    if(text !== null) {
      textInput.current = text;

       if(botState == "awake"){
       
           Auto_Completion(text);
      
      }  
    
    }

  };

const ai_interval = useRef<NodeJS.Timeout>();
function Auto_Completion(text: string){

  const input: string[] = [];
  // console.log(selectedGif)
  selectedGif.forEach(e=>{
    if(e.font){
      input.push(e.font.text)
    }
  })
  input.push(text)
  clearTimeout(ai_interval.current);
   ai_interval.current = setTimeout(() => {
     sendMessage(JSON.stringify({generate : "AI Request", Type:"completion", input: input, friend: uname})) 
    }, 1000);
}

function Terminate_Stream(){
  sendMessage(JSON.stringify({generate : "AI Request", terminate:"end", friend: uname})) 
}

const handleText = (text: string)=>{
        // setTransformgif((prev: any)=> prev ? false : true)
        // Keyboard.dismiss();

        if(text != '')

          setSelectedGif((prev: any) =>  [... prev, 
                    { id: prev.length, 
                      sender: userName,
                      uri:null, 
                      font: 
                      { 
                        text: text, 
                        bgColor: fontStylesAndLayout[uname].fontBgColor, 
                        fontFamily: fontStylesAndLayout[uname].fontFamily, 
                        color: fontStylesAndLayout[uname].fontBgColor === 'transparent' ? themeTextStyle.color : fontStylesAndLayout[uname].fontColor, 
                        size: fontStylesAndLayout[uname].fontSize 
                      }, 
                      transform: { "translateX": 0, "translateY": 0 , "rotate": `0rad`, "scale": 200, "flip": false} }]);

          
      }
 

  const [chatLists, setChatLists] = useState<ChatListProp[]|[]>();



  function updateFontFamily(item: { fontFamily: string; fontSize: number }) {

     fontStylesAndLayout[uname] = {...fontStylesAndLayout[uname], fontFamily: item.fontFamily, fontSize: item.fontSize};
     dispatch(setFontStyle(uname, fontStylesAndLayout[uname]));

  }
 
  

  function updateFontColor(item: { color: string; backgroundColor: string }) {
   
     fontStylesAndLayout[uname] = {...fontStylesAndLayout[uname], fontColor: item.color, fontBgColor: item.backgroundColor};
     dispatch(setFontStyle(uname, fontStylesAndLayout[uname]));

  }
  

  const keyExtractor = useCallback((item: ChatListProp) => item.id.toString(), []);

  const renderItem = useCallback(({ item }: { item: ChatListProp }) => {
      return <ChatMessage key={keyExtractor(item)} item={item} />;
    }, [chats]);
   
  const chatbot_icon = useRef<WebView>(null);

  const WakeupBot = () => {
    if (chatbot_icon.current) {
      chatbot_icon.current.injectJavaScript("Wakeup_Bot();");
    }
  };

  const SleepBot = () => {
    if (chatbot_icon.current) {
      chatbot_icon.current.injectJavaScript("Sleep_Bot();");
    }
  }

  const botState = useSelector((state: ContactsStateProp) => state.ContactUpdates.botState);
  const ChangeBotState = () => {
    botState == "sleep" ? WakeupBot() : SleepBot(); 
  }


  return (
 
       // <FlatList
          // ref = {flatListRef}
          // data={chatLists}
          // keyExtractor={keyExtractor}
          // renderItem={renderItem}
          // contentContainerStyle={{
          //   // paddingHorizontal: 10,
          //   // gap: 10,
          //   // borderWidth:2,
          //   // flex:1,
          //   width:"100%",
          //   height:  700  +  fontStylesAndLayout[uname].maxTranslateY + 700,
          //   opacity: 1
          //   // height: "20%",
          //   // position: 'absolute',
          //   // overflow: 'scroll',
          // }}
          // onScroll={handleScroll}
          // decelerationRate="fast"
          // // disableVirtualization = {true}
          // // initialNumToRender={10}
          // // windowSize={7}
          // // keyboardShouldPersistTaps="handled"
          // // maxToRenderPerBatch={10}
          // // updateCellsBatchingPeriod={20}
          // // removeClippedSubviews={true}

          // // getItemLayout={getItemLayout}  

          // // initialNumToRender={10} // Number of items to render initially
          // // windowSize={10} // Number of items to keep in memory outside of the viewport
          // // onEndReached={handleLoadMore}
          // // onEndReachedThreshold={0.5}
          // // automaticallyAdjustKeyboardInsets
          // />
      <View style={{flex:1}}>
     
      <View style={[styles.container, themeContainerStyle]} ref={viewRef} >
        <ScrollView 
        ref ={ScrollViewRef} 
        onScroll={handleScroll}
        style={[styles.msgContainer]}
        contentContainerStyle={{ 
          // flexGrow: 1,
          width:"90%",
          height:  700  +  fontStylesAndLayout[uname].maxTranslateY + 700 
        }}
        decelerationRate={"fast"} 
        >
          {/* { chats[uname].length!=0 &&  */}
          {/* { chatLists && uname in fontStylesAndLayout && */}
         
        {chatLists && chatLists.map((item)=>{
               return renderItem({ item })
          })}
        
          {/* } */}
        </ScrollView>

        {(selectedGif.length>0 && !isFocused && !textStyles) && ( <View style={styles.sendgifs}>
                <View style={{position: "absolute", flexDirection: "row", bottom: 0, gap:10}}>
                    <Button title="Send" onPress={sendTofriend} />
                    <Button title="Cancel" color={'red'} onPress={()=>setSelectedGif([])} />
               </View>
            </View>) }
        {
          scrollToBottom && <View style={{position:"absolute", bottom:10, left:10, flexDirection:"row", gap:10}}> 
            <Ionicons name="arrow-down" 
            size={30} 
            style={{ 
              borderRadius: 10, 
              padding:3,
              backgroundColor: 'rgba(125, 125, 125, 0.25)'
            }} 
            color={colorMode === 'dark' ? "white" : "black"} 
            onPress={()=>{scrollToLastMessage(true)}}/>
          </View>
        }


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
                 />  
          ))}
         </View> }
      </View>
      <KeyboardAvoidingView
      // style={{flex:1}}
      keyboardVerticalOffset= {0}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
       >
      
      { uname in fontStylesAndLayout && fontStylesAndLayout[uname].fontFamily && 
      <View style={[ styles.inputContainer, themeContainerStyle ]}>
      {/* <Ionicons name="camera-outline" size={30} color={colorMode === 'dark' ? "white" : "black"} /> */}
      {/* <Image source={require("@/assets/images/ai-icon.gif")} contentFit={"contain"} autoplay={true} style={{height:50, width: 50}}/>   */}
        <TouchableOpacity style={{ height:60, width: 70}} onPress={ChangeBotState}>
        <WebView
          ref = {chatbot_icon}
          style={{ backgroundColor: "transparent"}}
          source={{ html: animated_bot }}
          scalesPageToFit={false}
          originWhitelist={['*']}
          scrollEnabled={false}
          automaticallyAdjustContentInsets={false}
          javaScriptEnabled={true}
          androidLayerType="hardware" // For Android, ensures transparency works
          onMessage={(event) => {
            if(event.nativeEvent.data == "Bot Awake!"){
              dispatch(setBotState("awake"))
            }
            else if(event.nativeEvent.data = "Bot Asleep!"){
              dispatch(setBotState("sleep"))
            }
          }}

        />
        </TouchableOpacity>
        <TextInput style={[ 
            styles.inputText, 
            // themeTextStyle, 
            {
             fontFamily: fontStylesAndLayout[uname].fontFamily, 
             color:  fontStylesAndLayout[uname].fontBgColor === 'transparent' ? themeTextStyle.color : fontStylesAndLayout[uname].fontColor,
             fontSize: fontStylesAndLayout[uname].fontSize,
             backgroundColor: fontStylesAndLayout[uname].fontBgColor
            }
   
            ]}
          placeholder=" ... "
          placeholderTextColor={'rgba(147, 141, 141, 0.54)'}
          ref={inputRef}
          // value={textInput.current}
          onChangeText={handleGetText}
          editable={true}
          returnKeyType="send"
          multiline={true}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          allowFontScaling={false} />
          
          {(isFocused) 
          ? ( <View style={{ padding:10  }}>
                 <Text onPress={()=>{
                           handleText(textInput.current); 
                           textInput.current = "";
                           inputRef.current?.clear();
                 }} 
                 style={{
                  color: "white", 
                  backgroundColor: "rgb(24, 110, 208)", 
                  paddingVertical: 8, 
                  paddingHorizontal:10, 
                  borderRadius: 8}}>Select</Text>
              </View> )
          : (<View style={[styles.inputIcons]}>
              {/* <Ionicons name="document-outline" size={30} color={colorMode === 'dark' ? "white" : "black"} /> */}
              <TouchableOpacity>
                <Text style={{fontSize: 28, 
                            borderRadius: 10,
                            color: colorMode === 'dark' ? "white" : "black", 
                            backgroundColor: textStyles ? 'gray' : 'transparent',
                            fontFamily: fontStylesAndLayout[uname].fontFamily
                            }} onPress={()=>{setTextStyles(!textStyles);}}
                            allowFontScaling={false}> Aa </Text>
              </TouchableOpacity>
              <Ionicons name="happy-outline" size={30} style={{ borderRadius: 10, padding:3,backgroundColor: isGifPickerVisible ? 'gray' : 'transparent'}} color={colorMode === 'dark' ? "white" : "black"} onPress={()=>{setIsGifPickerVisible(!isGifPickerVisible)}}/>
             </View>)} 

       
        </View>}
      
         <View style={[styles.ai_container, {backgroundColor: colorMode == "dark" ? "black" : "white"}]}>
        { botState == "awake" && <AutoCompletion select = {handleText} /> } 
        </View>
     
        
       
        {/* </KeyboardAvoidingView>     */}

        { textStyles && (<View><FlatList
          data={fontBgColor}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {updateFontColor(item)}}>

               <Text style={[styles.fontList,{
                             color: item.color, 
                             backgroundColor: item.backgroundColor, 
                             borderColor: fontStylesAndLayout[uname].fontBgColor === item.backgroundColor ? "rgb(24, 110, 208)" : "transparent"
                            } ]}
               > Aa </Text>
            </TouchableOpacity>
              // console.log(item.backgroundColor)
          )}
          horizontal={true}
                             
          ListHeaderComponent={<TouchableOpacity 
                               style={[styles.fontList, 
                                  { borderColor: fontStylesAndLayout[uname].fontBgColor === 'transparent' ? "rgb(24, 110, 208)" : "transparent"}]}>
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
          data={fontFamily}
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
                             borderColor: item.fontFamily == fontStylesAndLayout[uname].fontFamily ? "rgb(123, 159, 200)" : 'transparent',
                            }}
                     allowFontScaling = {false}> Font </Text>
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
          />

          </View>)
         }

          { isGifPickerVisible && 
          <View style={{height: 300}}>
            <GIFpage setGif = {setSelectedGif} setgifpage={setIsGifPickerVisible} />
          </View> 
          }
      
      </KeyboardAvoidingView> 
     </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex:1,
    margin: 0,
    padding: 0,
    // zIndex: 0,
    // borderWidth:1,
    // height:300
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
    // gap: 10,
    // flexGrow: 1, 
    // paddingHorizontal: 20, 
    paddingVertical:10,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.46)',
     
  }, 
  inputText: { 
    flex:1,
    maxHeight: 140, 
    // maxWidth: "60%",
    borderColor: 'gray',
    // textAlignVertical: 'center',
    borderRadius:10, 
    // marginRight:10,
    borderWidth: 1, 
    padding: 10,
    // width: 20,
    flexGrow:1,
    // flexDirection:'row',  
  },
  inputIcons:{
    // flex:1,
    gap:5,
    // margin:10,
    flexDirection:"row",
    // alignSelf: "center",
    alignItems: 'center',
    // justifyContent:"center",
    padding:5, 
    // flexGrow: 1,

  },

  msgContainer:{
   flex:1,
   position: 'relative',
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

  ai_container:{
    height: "auto", 
    borderWidth: 1,
    borderStartEndRadius: 10,
    borderEndEndRadius: 10,
    borderColor: "rgba(79, 79, 79, 0.44)",
  }


});

export default ChatView;