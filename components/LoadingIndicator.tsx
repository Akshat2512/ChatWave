import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, ImageSourcePropType, Easing } from 'react-native';
import {Image} from "expo-image";
import { useSelector } from 'react-redux';
import { ContactsStateProp } from '@/store/contactReducer';

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function LoadingIndicator({source}:{source:ImageSourcePropType}) {
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const loopAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const fadeAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const ai_stream = useSelector((state: ContactsStateProp) => state.ContactUpdates.ai_stream)
  

  function startloopAnimation(){
      rotation.setValue(0);
      loopAnimation.current = Animated.loop(
        Animated.timing(rotation, {
            toValue: 1,
            duration: 2000, // 2 seconds for a full rotation
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
      );
      
      loopAnimation.current.start();
   }

  function startfadeAnimation(value: number){
     fadeAnimation.current = Animated.timing(opacity, {
      toValue: value,
      duration: 2000, // 1 second for fade-in
      useNativeDriver: true,
    });
     fadeAnimation.current.start();
    }


  useEffect(() => {
    startfadeAnimation(1);
    return () => {
      // Stop the loop animation when the component unmounts
        loopAnimation.current?.stop();
    };
    
  }, []);

  useEffect(()=>{
   if(ai_stream == "start"){
    // loopAnimation.current?.reset();
    // loopAnimation.current?.stop();
    startloopAnimation();
    // startfadeAnimation(1);
   }
   else if(ai_stream == "end"){

    loopAnimation.current?.stop();
    // startfadeAnimation(0);
   }
  

  }, [ai_stream])

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
    opacity: opacity
  };

  return (
    <View style={styles.container}>
      <AnimatedImage
        source={source} // Replace with your image URL
        style={[styles.image, animatedStyle]}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  image: {
    width: 30,
    height: 30,
  },
});
