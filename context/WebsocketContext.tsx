import React, { createContext, MutableRefObject, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useUser } from './UserContext';
import { NavigationProp, StackActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import useStorage from '@/hooks/useStorage';
import getResponse from '@/hooks/httpResponse';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { friendsProp, StateMngProp } from '@/store/userReducer';
import { ContactsStateProp } from '@/store/contactReducer';
import { logoutAction, setOnlineUsers, setUpdateState } from '@/store/userAction';
import { HandleMessage } from '@/hooks/handleMessages';
import { store } from '@/store/store';

// Define the context type
type WebSocketContextType = {
  socket: MutableRefObject<WebSocket | null>;
  connected: MutableRefObject<boolean>;
  recvMessage: any;
  setMessage: (message: any) => void;
  sendMessage: (message: any) => "sent" | "Websocket Disconnected" | "Websocket Connecting";

};

export type RootStackParamList = { "Account": undefined, "Login": undefined } // Define the chat route

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }: any) => {
  // const [socket, setSocket] = useState<WebSocket | null>(null);
  const [recvMessage, setMessage] = useState({});

  const socket = useRef<WebSocket | null>(null);
  
  const connecting = useRef<boolean>(false);
  const connected = useRef<boolean>(false);

  const { isSignedIn, userName, passWord, friends } = useSelector((state: StateMngProp) => state.userData);

  const { token, setToken } = useUser();


  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const dispatch = useDispatch()
 
  function UpdateTabs(ret: "Update Friend Tab" | {
    update: string;
    users: string[];
} | {
    update: string;
    users: friendsProp[];
} | undefined ){
    if(ret == 'Update Friend Tab'){
      sendMessage('{"get":"search_friends"}')
      return
    }

    if (typeof ret === 'object' && 'update' in ret && ret.update == "Update last_seen") {
      ret.users.forEach(e => sendMessage(`{"update": "last_seen", "uname": "${e}"}`))
      return
    }

    if(typeof ret === 'object' && 'update' in ret && ret.update == "Update Messages"){
      const chats = store.getState().chatData.chats;
      const list: any = [];
      ret.users.forEach((e: any) => {
        if(chats[e["uname"]]?.updated_on){
          list.push({friend: e["uname"], "updated_on": chats[e["uname"]].updated_on})
        }
        else
         list.push({friend: e["uname"], "updated_on": "null"})
      });
      sendMessage(JSON.stringify({"update": "messages", "friends_data": list}))
      return
    }
   }



  function connectWebSocket(token: string | null): Promise<WebSocket | null> {

    return new Promise((resolve, reject) => {
 
      const url = process.env.EXPO_PUBLIC_WEBSOCKET_URL;

      if (token) {
        const socket = new WebSocket(url + token);
        console.log('connecting ...');
        socket.onopen = () => {
          console.log('WebSocket connected');

          // if(connected.current)
          //   navigation.dispatch(StackActions.replace('Account'));
          
          connected.current = true
          connecting.current = true
          resolve(socket);
        };

        socket.onmessage = async (event) => {

          const message = JSON.parse(event.data);
            //  console.log(event.data)
            const currentFriends = store.getState().userData.friends;  // Get the latest reference
            const search = store.getState().ContactUpdates.searchUser;
            const online = store.getState().ContactUpdates.onlineUsers;   
          
            const ret = HandleMessage(message, userName, online, currentFriends, search, dispatch)
                
            UpdateTabs(ret)

         
          // setMessageQueue((prevQueue) => [...prevQueue, message]);
        }

        socket.onclose = () => {
          console.log("Websocket disconnected");
          connecting.current = false;
      
        }

        socket.onerror = (error) => {
          console.log('WebSocket error observed:', error);
          Alert.alert("Server Error", "WebSocket Failed to connect ...", 
            [
                  {
                    text: 'Go to Login Page',
                    onPress: () => {
                      dispatch(logoutAction());
                      navigation.dispatch(StackActions.replace('Login'));
                    },
                  },
                  { 
                    text: 'Close', 
                    onPress: () => {}
                  },

            ]);
          connecting.current = false;
          reject(socket)
        }

        // const connectionTimeout = setTimeout(() => {
        //   if (socket.readyState !== WebSocket.OPEN) {
        //     console.log('Connection timeout. Reconnecting...');
        //     socket.close(); // Close the current connection
        //     console.log('reconnecting ...');
        //     loadCredentialsAndLogin()

        //   }
        // }, 5000);

        // return reject('URL or token is missing');
      }

    })

  }

  useEffect(() => {
    if (token) {
      const connectionTimeout = setTimeout(async () => {
        if (socket.current?.readyState !== WebSocket.OPEN) {
          console.log('Connection timeout. Reconnecting...');
          socket.current?.close(); // Close the current connection
          socket.current = await connectWebSocket(token);
        }
      }, 2000);
   
    return () => {
      if (connectionTimeout)
        clearTimeout(connectionTimeout);
    } }
    else if (!token && isSignedIn){
       loadCredentialsAndLogin();
    }
  }, [token])


  const sendMessage = (message: any) => {
    try {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(message);
        return "sent";
      }
      else if (socket.current?.readyState === WebSocket.CONNECTING) {
        console.log('WebSocket is connecting...');
        return "Websocket Connecting";
      }
      else if (socket.current?.readyState === WebSocket.CLOSING) {
        console.log('WebSocket is closing...');
        return "Websocket Connecting";
      }
      else if (socket.current?.readyState === WebSocket.CLOSED) {
        console.log('WebSocket is Closed', connecting.current);
        if (!connecting.current) {
          loadCredentialsAndLogin();
          dispatch(setUpdateState("wait"))
          connecting.current = true;
        }
        return "Websocket Connecting";
      }

      return "Websocket Connecting"
    }
    catch (error) {
      console.log(error);
      return "Websocket Disconnected";

    }
  }





  const loadCredentialsAndLogin = async () => {
    try {
      console.log(userName, passWord)
      if (userName && passWord) {
        // indicatorVisible(true)
        const response = await getResponse("auth", { "user": userName, "pwd": passWord });
        // indicatorVisible(false)
        console.log(response)
        if (response["status"] == 'success') {
          setToken(response.token)
          // navigation.navigate('Account');
        }
        else {
            Alert.alert("Login Failed", "Network or Server Error ...", 
              [
                { text: 'Go to login Page',
                  onPress: () => { connected.current = false; navigation.dispatch(StackActions.replace('Login')) }},
                { text: 'Close', 
                  onPress: () => {} },
              ]);

          connecting.current = false;
          // dispatch(logoutAction());
          // if (!isSignedIn)
          //   navigation.navigate('Login');
        }
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, connected, recvMessage, setMessage, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};


export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

