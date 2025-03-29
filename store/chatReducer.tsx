import { ImageSourcePropType } from "react-native";
import { CHAT_QUEUE, CHAT_RECIEVED, CHAT_SENT, CHAT_STORE, CHAT_UPDATE, CREDENTIAL, FAV_GIFS, LOGIN, LOGOUT, PROFILE_DETAILS, PROFILE_NAME, REM_FAV_GIFS, SET_STYLES, UPDATE_CHATLIST, USER_PROFILE_IMG} from "./types";
import { ChatListProp } from "@/interfaces/ChatInterface";


export interface ChatStyles{
    fontFamily: string;
    fontSize: number;
    fontColor: string;
    fontBgColor: string;
    maxTranslateY: number;
}

export interface ChatStateProp{
    chatData : {
        chats: { [key : string] : {Messages: ChatListProp[] | [], updated_on: string} };
        msg_que: { [key : string] :  number[] };
        fontStylesAndLayout: { [key : string] : ChatStyles };
        favGifs: string[];
    }

}


const initialState: ChatStateProp['chatData'] = {
    chats: {},
    msg_que: {},
    fontStylesAndLayout: {},
    favGifs: [],
}


export default (state = initialState, {type, payload}: {type: any, payload: any}) => {
     
    switch (type) {
        
        case LOGOUT:
            return {
              ...state, chats: {}, fontStylesAndLayout: {}, msg_que: {}
            }
        

        case CHAT_STORE : 
            return {
                ...state, 
                chats: { 
                    ...state.chats, 
                    [payload.uname] : { 
                          ...state.chats[payload.uname], 
                          Messages: [ 
                          ... payload.chats, 
                          ...(state.chats[payload.uname]?.Messages || []) 
                          ]
                    }
                },
                 fontStylesAndLayout: { 
                    ...state.fontStylesAndLayout,
                    [payload.uname] : {
                        ...state.fontStylesAndLayout[payload.uname],
                        maxTranslateY: payload.maxTranslateY 
                    }
                }  
            }
        
        case CHAT_UPDATE : {
         
            // console.log("set chat update: ", state.chats)
            return { ...state, 
                chats: payload.chats,
                fontStylesAndLayout: payload.fontStyles
            };
        }
                
        case CHAT_SENT:
            state.chats[payload.recipient].updated_on = payload.updated_on
            return{
                ...state,
                msg_que: {
                    ...state.msg_que,
                    [payload.recipient]: payload.ids
                   }

            }
            
        case CHAT_RECIEVED :
                return {
                    ...state,
                    chats: {
                        ...state.chats,
                        [payload.sender]: {
                            Messages: [
                                ... payload.chats, 
                                ...(state.chats[payload.sender]?.Messages || []) 
                            ],
                            updated_on: payload.updated_on
                        }
                    }
                }

        case SET_STYLES :
            return { ...state, fontStylesAndLayout: {...state.fontStylesAndLayout, [payload.uname] : payload.styles }}
           
        case FAV_GIFS :
            return { ...state, favGifs: [ payload, ...state.favGifs ] }
            
        case REM_FAV_GIFS :
            return { ...state, favGifs: payload }


        }
        
    return state;
}