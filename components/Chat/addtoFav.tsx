import { useTheme } from "@/context/ThemeContext";
import { ChatStateProp } from "@/store/chatReducer";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";





export default function AddFavorite({item}: {item:string}){

    const {themeTextStyle} = useTheme();
    
    return (
          <View style={{backgroundColor: "", alignItems:"flex-start"}}>
             <Ionicons name= "star" size={24} color={themeTextStyle.color} />
          </View>
        
    )
} 