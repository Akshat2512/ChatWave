import { ImageSourcePropType } from "react-native";
import { AI_COMPLETION, BOT_STATE, CHAT_QUEUE, CHAT_RECIEVED, CHAT_SELECT, CHAT_SENT, CHAT_STORE, CHAT_UPDATE, CONTACT_PROFILE_IMG, CREDENTIAL, FAV_GIFS, LOGIN, LOGOUT, ONLINE_USERS, PROFILE_DETAILS, PROFILE_NAME, REM_FAV_GIFS, SEARCH_GIFS, SEARCH_USERS, SET_STYLES, UPDATE_CHATLIST, UPDATE_STATE, USER_PROFILE_IMG} from "./types";
import { ChatListProp } from "@/interfaces/ChatInterface";
import { friendsProp } from "./userReducer";
import { ChatStyles } from "./chatReducer";
import { store } from "./store";

  

export const loginAction = (uname: string, pwd: string) => {
    return {
        type: LOGIN,
        payload: {isSignedIn: true, uname: uname.toLowerCase(), pwd: pwd}
    }
}

export const logoutAction = () => {
    return {
        type: LOGOUT,
        payload: false
    }
}

export const setProfileImgAction = (profileImage: string | null, updated_on: string) => {
    console.log("type of profileImage: ", typeof(profileImage), profileImage)  
    if (profileImage != "null" && profileImage != null) 
    return {
        type : USER_PROFILE_IMG,
        payload: {uri: `data:image/png;base64,${profileImage}`, updated_on: updated_on}
    }
    return {
        type : USER_PROFILE_IMG,
        payload: {uri: null, updated_on: updated_on}
    }
}

export const setProfileDetails = (name: string, created_on: string) => {
    return {
        type: PROFILE_DETAILS,
        payload: {name: name, created_on: created_on}
    }
}

export const setProfileName = (name: string) => {
    return {
        type: PROFILE_NAME,
        payload: name
    }
}

export const setChatStorage = (uname: string, chats: ChatListProp[] | [], maxTranslateY: number) => {
    return {
        type: CHAT_STORE,
        payload: { uname: uname, chats: chats, maxTranslateY: maxTranslateY }
    }
}


export const setChatUpdate = (chats: { [key: string]: {Messages: ChatListProp[], started_on: string, updated_on: string, maxTranslateY: number }}) => {
    // console.log("set chat update: ", chats)
    const keys = Object.keys(chats);
    const chat_state =  { ...store.getState().chatData.chats };
    const fontStyles =  { ...store.getState().chatData.fontStylesAndLayout };
    
    keys.forEach(e=>{
        if(!(e in chat_state)){
         chat_state[e] = {Messages:[], updated_on: "null"}
        }
        if(!(e in fontStyles)){
         fontStyles[e] = {fontFamily: "GoogleSans", fontSize: 15, fontColor: "", fontBgColor: "transparent", maxTranslateY: 0 }
        }
 
        const len = chat_state[e].Messages.length;
        var client_chat_started_on = "";
        if (len == 0){
            client_chat_started_on = "null";
        }
        else{
            client_chat_started_on = chat_state[e].Messages[len-1].time;
        }
        console.log("Update time for", e," : ", client_chat_started_on," ", chats[e].started_on)
        if(client_chat_started_on != chats[e].started_on){
            chat_state[e] = {Messages:[], updated_on: "null"}
            fontStyles[e] = {fontFamily: "GoogleSans", fontSize: 15, fontColor: "", fontBgColor: "transparent", maxTranslateY: 0 }
        }

        const Id_sets = new Set(chat_state[e].Messages.map((message: any) => message.id));
        const filtered_update_messages = chats[e].Messages.filter((message: any) => !Id_sets.has(message.id));
        
        chat_state[e] = { Messages:  [ ...(filtered_update_messages), ...(chat_state[e]?.Messages)], updated_on :chats[e]?.updated_on  }
   
        if(chat_state[e].Messages.length > 0){
          if(fontStyles[e].maxTranslateY < chats[e].maxTranslateY){
             fontStyles[e].maxTranslateY = chats[e].maxTranslateY; 
        } 
        }
    })

    return {
        type: CHAT_UPDATE,
        payload: {chats: chat_state, fontStyles: fontStyles}
    }
}

export const setChatSent = (recipient: string, ids: number[], updated_on: string) => {
    console.log(ids)
   return {
    type: CHAT_SENT,
    payload: { recipient: recipient, ids: ids, updated_on: updated_on}
   }
}

export const setChatRecieved = (sender: string, chats: ChatListProp[] | [], updated_on: string) => {
    if(chats.length > 0)
   { 
    const fontStyles =  { ...store.getState().chatData.fontStylesAndLayout };
    var maxTranslateY = 0;
    chats.forEach(e=>{
        if(e.transform.translateY>maxTranslateY)
           maxTranslateY = e.transform.translateY
    })
        if(fontStyles[sender].maxTranslateY < maxTranslateY)
           fontStyles[sender].maxTranslateY = maxTranslateY; 
    }
    return {
        type: CHAT_RECIEVED,
        payload: {sender: sender, chats: chats, updated_on: updated_on}
    }
}

export const selectChat = ( userDetails : {uname: string, name: string, last_seen: string} | null) => {
    return {
        type: CHAT_SELECT,
        payload : userDetails 
    }
}

export const setContactProfileImg = (profileImg : ImageSourcePropType) => {
    return {
        type: CONTACT_PROFILE_IMG,
        payload : profileImg
    }
} 

export const setOnlineUsers = (users: string[]) => {
     return {
        type: ONLINE_USERS,
        payload : users
     }
}

export const setSearchList = (list: string[]) => {
       return {
        type: SEARCH_USERS,
        payload: list
       }
}

export const setFriendsList = (list: friendsProp[]) => {
    return {
        type: UPDATE_CHATLIST,
        payload: list
    }
}


export const setGifsList = (list: string[]) => {
    return {
        type: SEARCH_GIFS,
        payload: list
    }
}

export const setFavGif = (item: string) => {
    return {
        type: FAV_GIFS,
        payload: item
    }
}

export const remFavGif = (list: string[]) =>{
  return {
    type: REM_FAV_GIFS,
    payload: list
  }
}


export const setFontStyle = (uname: string, styles: ChatStyles) => {
    return {
        type: SET_STYLES,
        payload: {uname: uname, styles: styles}
    }
}

export const setUpdateState = (state: string) => {
    return {
        type: UPDATE_STATE,
        payload: state
    }
}

export const setBotState = (state: string) => {
    return {
        type: BOT_STATE,
        payload: state
    }
}

export const setAICompletion = (input: string) => {

    return {
        type: AI_COMPLETION,
        payload: input
    }
}

// export const setAIStream = (state: string) => {
//     return {
//         type: AI_STREAM,
//         payload: state
//     }
// }