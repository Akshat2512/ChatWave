import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { View, Text, StyleSheet  } from 'react-native';
import DraggableImage from "./draggableContainer";


export default function BubbleMessage({name, message}: {name: string; message: string; })
{

const { colorMode } = useTheme();

const styles = StyleSheet.create({
    bubble: {
        maxWidth:'80%',
        padding:10,
        borderRadius: 15,
        backgroundColor : colorMode === "dark" ? "rgb(65, 66, 66)" : "rgb(210, 214, 215)",
        
        alignSelf: name === "Sender" ? "flex-start" : "flex-end"
    },
    bubbleText:{
        color: colorMode === "light" ? "rgb(65, 66, 66)" : "rgb(161, 161, 161)",
    },
    draggable:{
        position: "absolute",
        top:-600,
        backgroundColor : colorMode === "dark" ? "rgb(65, 66, 66)" : "rgb(210, 214, 215)",
        padding:10,
        borderRadius: 15


    }

}

)
    return (
        <View style = {styles.bubble}>
            {message && <Text style = {styles.bubbleText}>{message}</Text>}
        </View>
    )
}
