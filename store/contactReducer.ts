
import { AI_COMPLETION, BOT_STATE, CHAT_SELECT, LOGOUT, ONLINE_USERS, SEARCH_GIFS, SEARCH_USERS, UPDATE_STATE } from "./types";


export interface ContactsStateProp{
    ContactUpdates : {
        chatSelect:  {uname:string, name:string, last_seen:string};
        onlineUsers: string[];
        searchUser: any;
        gifs: string[];
        updateState: string;
        botState: string;
        ai_stream: string | null;
        ai_completion: string | null
    }

}


const initialState: ContactsStateProp['ContactUpdates'] = {
    chatSelect: {uname:"", name: "", last_seen: ""},
    onlineUsers: [],
    searchUser: [],
    gifs: [],
    updateState:"wait",
    botState:"sleep",
    ai_stream: null,
    ai_completion: null

}


export default (state = initialState, {type, payload}: {type: string, payload: any}): ContactsStateProp['ContactUpdates'] => {
     
    switch (type) {
        case LOGOUT :
            return {...initialState}

        case CHAT_SELECT :
            return {...state, chatSelect: payload}

        case ONLINE_USERS :
            return {...state, onlineUsers : payload}
        
        case SEARCH_USERS :
            return {...state, searchUser: payload}

        case SEARCH_GIFS :
            return {...state, gifs: payload}

        case UPDATE_STATE :
            return {...state, updateState: payload}

        case BOT_STATE :
            return {...state, botState: payload}

        case AI_COMPLETION :
            if(payload == "<stream>")
            {
                return {...state, ai_stream:"start", ai_completion: ""}
            }
            else if(payload == "</stream>")
            {
                return {...state, ai_stream:"end"}
            }
            else if(payload == "<terminate>"){
                return {...state, ai_stream:null, ai_completion:""}
            }
            // else if(payload == "<terminate>")
             return {...state, ai_completion: state.ai_completion + payload}

    }

    return state;
}