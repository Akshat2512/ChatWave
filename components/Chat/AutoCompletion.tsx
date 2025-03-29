import { useTheme } from "@/context/ThemeContext";
import { ContactsStateProp } from "@/store/contactReducer";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import LoadingIndicator from "../LoadingIndicator";



export default function AICompletion({select}:{select: (text: string)=>void}){
    // console.log("Ai chat renders");
    const {themeContainerStyle, themeTextStyle} = useTheme();
    const ai_completion = useSelector((state: ContactsStateProp)=> state.ContactUpdates.ai_completion);

    return (
        <View style={[styles.ai_container]}>
          <LoadingIndicator source={require("@/assets/images/gear-icon.svg")} />
            <TouchableOpacity
            style={{ maxWidth:"90%"}} 
            onLongPress={()=> {
              if(ai_completion)
                select(ai_completion);
            }}
            onPress={() => {
              
            }}>
                <Text style={[themeTextStyle, styles.textStyle]}>
                  {ai_completion}
                </Text>
          </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({

  ai_container:{
    // flex: 1,      
    flexDirection:"row",
    gap:10,
    height: "auto", 
    padding: 10,
    alignItems: "center",
    borderRadius:10,
    width: "100%"
  },

  textStyle:{
    fontFamily:"GoogleSans", 
    fontSize: 16, 
    backgroundColor: "rgba(66, 65, 65, 0.37)",
    padding:10,
    borderRadius: 10,
   
  }
})