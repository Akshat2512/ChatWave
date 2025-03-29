import { ImageSourcePropType } from "react-native";
import { CHAT_STORE, CREDENTIAL, LOGIN, LOGOUT, PROFILE_DETAILS, PROFILE_NAME, UPDATE_CHATLIST, USER_PROFILE_IMG} from "./types";


export interface friendsProp{
    id: string; 
    uname: string;
    name: string | null,
    message: string | null,
    status: string | null,
    lastseen: string | null,
    profileImage: { uri: string | null, updated_on: string | null },
}



export interface StateMngProp{
    userData : {
        isSignedIn: boolean;
        userName: string | null;
        passWord: string | null; 
        profileImg: { uri: string | null, updated_on: string | null } ;
        profileDetails: {name: string | null, created_on: string | null};
        friends: friendsProp[] | [];
    }

}


const initialState: StateMngProp['userData'] = {
    isSignedIn: false,
    userName: null,
    passWord: null,
    profileImg: { uri: null, updated_on: null },
    profileDetails: {name: null, created_on: null},
    friends: []
}


export default (state = initialState, {type, payload}: {type: any, payload: any}) => {
     
    switch (type) {
        case LOGIN : 
              return  {...state, isSignedIn: payload.isSignedIn, userName: payload.uname, passWord: payload.pwd} 

        case LOGOUT : 
              return { ...initialState}
                
        case USER_PROFILE_IMG: 
              return {...state, profileImg: payload}

        case PROFILE_DETAILS :
              return {...state, profileDetails: payload}

        case PROFILE_NAME :
              return {...state, profileDetails: {...state.profileDetails, name: payload}}

        case UPDATE_CHATLIST :
              return {...state, friends: payload}

    }
    // console.log(payload);
    return state;
}