import { useTheme } from "@/context/ThemeContext";
import { ContactsStateProp } from "@/store/contactReducer";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useSelector } from "react-redux";
import LoadingIndicator from "../LoadingIndicator";



export default function AICompletion({select, inputRef, textInput}:{select: (text: string)=>void, inputRef: React.RefObject<TextInput>, textInput: React.MutableRefObject<string>}) {
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
              inputRef.current?.setNativeProps({ text: "" });
              inputRef.current?.setNativeProps({ text: ai_completion });
              if (ai_completion !== null) {
                textInput.current = ai_completion;
              }
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
    fontFamily:"SpaceMono", 
    fontSize: 16, 
    backgroundColor: "rgba(66, 65, 65, 0.37)",
    padding:10,
    borderRadius: 10,
   
  }
})