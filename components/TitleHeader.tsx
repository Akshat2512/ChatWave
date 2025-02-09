import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';



interface TitleHeaderProps {
  Username: string;
  photoUrl: string;
}

const TitleHeader: React.FC<TitleHeaderProps> = ({ Username, photoUrl }) => {
  const  { colorMode } = useTheme(); 

  
const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
     
    },
    photo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    username: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorMode === "light" ? "gray" : "black",
    },
  });

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUrl }} style={styles.photo} />
      <Text style={styles.username}>{Username}</Text>
    </View>
  );
};


export default TitleHeader;
