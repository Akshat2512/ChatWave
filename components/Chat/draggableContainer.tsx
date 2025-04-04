import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Image as AniImage } from "expo-image";
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image as StaticImage, View, Text} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatListProp, fontProp } from '@/interfaces/ChatInterface';


type Props = {
  id        : number;
  imageSize : number;
  uri       : string | null;
  font      : fontProp | null;
  setgif    : React.Dispatch<React.SetStateAction<[] | ChatListProp[]>>;
};

export default function DraggableImage({ id, imageSize, uri, font, setgif }: Props) {

  const [isPlaying, setIsPlaying] = useState(true);
  const scaleImage = useSharedValue(imageSize);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const pinchScale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const [isFlipped, setIsFlipped] = useState<Boolean>(false);


  useEffect(() => {
    // Initialize shared values after the component mounts
    scaleImage.value = imageSize;
    translateX.value = 0;
    translateY.value = 0;
    rotation.value = 0;
    pinchScale.value = 1;
    baseScale.value = 1;
  }, [imageSize]);

  const imageStyle = useAnimatedStyle(() => {
    return {
      width: scaleImage.value * pinchScale.value, 
      height: scaleImage.value * pinchScale.value, 
    };
  });
  
 const textStyle = useAnimatedStyle(() => {
  return {
    transform: [{ scale: withSpring((scaleImage.value * pinchScale.value)/200, {
      damping: 10, // Lower value for more bounciness
      stiffness: 300, // Higher value for more stiffness
    }), }],
    // maxWidth: withSpring((scaleImage.value * pinchScale.value)/80, {
    //   damping: 10, // Lower value for more bounciness
    //   stiffness: 300, // Higher value for more stiffness
    // })
  };
});
  
  const rotate = Gesture.Rotation().onChange(event => {
    rotation.value += event.rotationChange;
    runOnJS(getTransformData)();
    // console.log('rotation:', rotation.value)
  });

  const pinch = Gesture.Pinch()
  .onStart(() => {
    baseScale.value = pinchScale.value;
  })
  .onChange(event => {
    pinchScale.value = baseScale.value * event.scale;
    runOnJS(getTransformData)();
    
  });

 

  const drag = Gesture.Pan().onChange(event => {
    translateX.value += event.changeX;
    translateY.value += event.changeY;
    runOnJS(getTransformData)();
  });

  function Transform(){
    
      const centerX = (scaleImage.value * pinchScale.value) / 2;
      const centerY = (scaleImage.value * pinchScale.value) / 2;

      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { translateX: centerX },
          { translateY: centerY },
          { rotate: `${rotation.value}rad` },
          { translateX: -centerX },
          { translateY: -centerY },
        ],
      };
    }
  

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null >(null);
  
  function getTransformData(){
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setTimeout(() => {
        setgif((prev: any) =>  
          {
          var data = [... prev];
          if(prev.length !== 0){
           data[id].transform = {"translateX": translateX.value, "translateY": translateY.value, "rotate": `${rotation.value}rad`, "scale": scaleImage.value * pinchScale.value, "flip": isFlipped };
          }
          return data;
          }
        )}, 
        100);
  }


  
  const containerStyle = useAnimatedStyle(Transform);
  
  // function getTransformGifData(id: number){
  //  return {}
  // }
  
  // setTransformData();

  const removeItem = Gesture.Tap().onStart(() => {
    // console.log('id:', id )
    runOnJS(removeGif)(id);
  });

  function removeGif(id: number) {

    setgif((prev: any) => prev.map((item: any) => {
      if (item.id === id) {
        return { };
      } else {
        return item;
      }
    }));
    
  }


  const flipItem = Gesture.Tap().onStart(() => {
    runOnJS(setIsFlipped)(!isFlipped);
  });

  useEffect(()=>{
    runOnJS(getTransformData)();
  }, [isFlipped])



  return (
    <GestureDetector gesture={Gesture.Simultaneous(drag, rotate, pinch)}>
    
      <Animated.View style={[containerStyle,  { top: 20, left: 20 }]}>
          <Animated.View style={[styles.imageContainer, imageStyle , { borderWidth: 3, height: 200, width: 200,
                                 borderColor:"rgb(10, 235, 255)"}]}>
           
    
            {font && <View style={{
                  // borderWidth: 3, 
                  padding: 12,
                  width:200,

                  // borderColor:"rgba(0, 0, 0, 0)",
                  // position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                  }
            }><Animated.Text style={[{
                           position: 'absolute',
                           //  justifyContent: 'center',
                           //  alignItems: 'center',
                          //  textAlign: 'center',
                           color: font.color, 
                           backgroundColor:font.bgColor, 
                           fontFamily: font.fontFamily, 
                           fontSize: font.size,
                           padding: 10, 
                           borderRadius: 10,
                           boxShadow: font.bgColor == 'transparent' ? '' : '0 2px 4px rgba(0, 0, 0, 0.46)', 
                        }, textStyle]}
                        allowFontScaling={false}>{font.text}</Animated.Text></View> }

            {uri && <><AniImage source={{ uri: uri }} placeholder={require('@/assets/images/ball_icon-ezgif.com-resize.gif')} style={[styles.image, { transform: [{ scaleX: isFlipped ? -1 : 1 }] }]} contentFit="contain" key={id} />
          <GestureDetector gesture={flipItem}>
            <View style={{ position: 'absolute', top: -25, left: -25, zIndex: 1 }}>
              <Ionicons name="sync-circle" size={30} color="rgb(10, 235, 255)" />
            </View>
          </GestureDetector></>
            }
  
            <GestureDetector gesture={removeItem}>
              <View style={{ position: 'absolute', top: -25, right: -25, zIndex:1 , width: 33}}>
                <Ionicons name="close-circle" size={30} color="red" />
              </View>
            </GestureDetector>
          
          </Animated.View>
    
        
      </Animated.View>
      
    </GestureDetector>

  );
}

const styles = StyleSheet.create({
    imageContainer: {
      
      position: 'absolute',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      // borderWidth:3,
      borderRadius: 20,
      padding:20,
      backgroundColor: "rgba(215, 218, 218, 0.14)",
      // bottom:0,
    },
    image: {
      width: '100%',
      height: '100%',
      zIndex: 0,
    },
  });



