import { ChatListProp } from "@/interfaces/ChatInterface";
import React, {memo, useCallback, useEffect} from "react";
import { View,Text, StyleSheet } from "react-native";
import { Image } from 'expo-image';

import { useTheme } from "@/context/ThemeContext";



const message = ({item}: {item: ChatListProp}) => {
  const { themeTextStyle} = useTheme();
  
  // console.log('MyComponent re-rendered id:', item.id);
  useEffect(() => {
    console.log('MyComponent re-rendered id:', item.id);
  }, []);

    return (
        
       <View style={[styles.adjustImg, {
                                              top: item.transform.translateY + 20 + 0.1, 
                                              left: item.transform.translateX + 20 + 0.1, 
                                              width:  item.transform.scale, 
                                              height: item.transform.scale,
 
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
                            
                                                  // {scale: item.font ? item.transform.scale/200 : 1}
                      
                                            
                                              ], 
                                              transformOrigin: 'center'
                                        
                                              }]}>
                                { item.uri && 
                                             <Image source={item.uri} 
                                              contentFit={"contain"}
                                              placeholder={require('@/assets/images/ball_icon-ezgif.com-resize.gif')}
                                              transition={2000}
                                              style = {styles.image}
                                              cachePolicy="disk"
                                              // autoplay = {true}
                                              // cachePolicy={'memory-disk'}
                                              autoplay = {true}
                                              // allowDownscaling = {true}

                                              />
                                           
                                              }
                               {item.font && <View style={{
                                    // borderWidth: 3, 
                                    padding: 12,
                                    // borderColor:"rgba(0, 0, 0, 0)",
                                    // position: 'absolute',
                                    // height: 200,
                                    width: 200,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                   
                               }}>
                               <Text style =
                                {{color: item.font.bgColor == 'transparent'?  themeTextStyle.color : item.font.color,
                                  position: 'absolute',
                                  // maxWidth: 200,
                                  // flexWrap: 'wrap',
                                  // top: '50%',
                                  // left: '50%',
                                  // borderWidth: 3, 
                                  // borderColor:"rgb(10, 235, 255)",
                                  backgroundColor:item.font.bgColor, 
                                  fontFamily: item.font.fontFamily, 
                                  fontSize: item.font.size, 
                                  padding: 10, 
                                  borderRadius: 10, 
                                  boxShadow: item.font.bgColor == 'transparent' ? '' : '0 2px 4px rgba(0, 0, 0, 0.46)', 
                                  transform: [
                                    {scale: item.font ? item.transform.scale/200 : 1}                        
                                  ] 
                                }}
                                allowFontScaling={false}
                                >{item.font.text}</Text></View>
                                 }
                               </View>
    )
}

export default memo(message);
// export default message;


const styles = StyleSheet.create({

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

});