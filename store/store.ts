import { combineReducers, createStore } from "redux";
import userReducer from "./userReducer";
import  { persistReducer, persistStore } from "redux-persist";
import storage from "@react-native-async-storage/async-storage";
import contactReducer from "./contactReducer";
import chatReducer from "./chatReducer";
// import thunk from "redux-thunk";

const userPersistConfig = {
     key: "user",
     storage
}
   
const chatPersistConfig = {
     key: "chat",
     storage
}

const rootReducer = combineReducers({
     userData: persistReducer(userPersistConfig, userReducer),
     chatData: persistReducer(chatPersistConfig, chatReducer),
     ContactUpdates: contactReducer
});

export const store = createStore(rootReducer)
export const persistor = persistStore(store)
