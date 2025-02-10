import { ImageSourcePropType } from "react-native";
import { CREDENTIAL, LOGIN, LOGOUT, NAME, USER_PROFILE_IMG } from "./types";


export interface StateMngProp{
    userData : {
        isSignedIn: boolean;
        userName: string;
        passWord: string; 
        name: string;
        profileImg: ImageSourcePropType
    }
}


const initialState = {
    isSignedIn: false,
    userName: "",
    passWord: "",
    profileImg: require("@/assets/profiles/images/default.png"),
    name: "",
}

export default (state = initialState, {type, payload}: {type: any, payload: any}) => {
     
    switch (type) {
        case LOGIN : 
           return  {...state, isSignedIn: payload} 

        case LOGOUT : 
           return {...state, isSignedIn: payload}
                
        case CREDENTIAL : 
           return {...state, userName: payload.un.toLowerCase(), passWord: payload.pwd }
        
        case USER_PROFILE_IMG: 
            return {...state, profileImg: payload}

        case NAME :
            return {...state, name: payload}

    }
    // console.log(payload);
    return state;
}