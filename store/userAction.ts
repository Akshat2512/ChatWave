import { ImageSourcePropType } from "react-native";
import { CREDENTIAL, LOGIN, LOGOUT, NAME, USER_PROFILE_IMG } from "./types";



export const loginAction = () => {
    return {
        type: LOGIN,
        payload: true
    }
}

export const logoutAction = () => {
    return {
        type: LOGOUT,
        payload: false
    }
}

export const setUserCredentialAction = (userName : string, passWord : string) => {
    return {
        type: CREDENTIAL,
        payload: { un : userName, pwd: passWord }
    }
}

export const setProfileImgAction = (profileImage: ImageSourcePropType) => {
    return {
        type : USER_PROFILE_IMG,
        payload: profileImage
    }
}

export const setName = (name: string) => {
    return {
        type: NAME,
        payload: name
    }
}