import React from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

const LoadingIndicator = ({ opacity }: { opacity: Animated.Value }) => {
  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* <Text>Loading...</Text> */}
      <Image source={require('@/assets/images/chatwave-icon.png')} style={{ alignSelf: 'center' }} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'black',
  },
});

export default LoadingIndicator;
