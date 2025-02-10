import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { NavigationProp, StackActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import useStorage from '@/hooks/useStorage';
import getResponse from '@/hooks/httpResponse';
import { AppState, AppStateStatus } from 'react-native';

// Define the context type
type WebSocketContextType = {
  recvMessage: any;
  setMessage: (message: any) => void;
  search_res: any;
  sendMessage: (message: any) => void;
  recvGifs: any;
  recvImage: any;
  recvNotify: any;
};

export type RootStackParamList = { "Account": undefined, "Login": undefined } // Define the chat route

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }: any) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [recvMessage, setMessage] = useState({});
  const [recvImage, setImage] = useState({});
  const [search_res, setSearch] = useState({});
  const [recvNotify, setNotification] = useState({});
  const [recvGifs, setGifs] = useState({});
  const storage = useStorage();
  const [messageQueue, setMessageQueue] = useState<any[]>([]);

  const { token, setToken } = useUser();
  // const maxRetries = 5;

  const [connected, setConnection] = useState(true);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // const [appState, setAppState] = useState(AppState.currentState);

  // const handleAppStateChange = (nextAppState: AppStateStatus) => {
  //   // if(socket){
  //   //   socket.close();
  //   // }
  //   if (appState.match(/inactive|background/) && nextAppState === 'active') {
  //     // Reload the app by navigating to the initial screen
  //     console.log('App has come to the foreground!');
  //     navigation.dispatch(StackActions.replace('Account'));
  //     // navigation.navigate('Login');
  //   }
  //   setAppState(nextAppState);
  // };

  // useEffect(() => {
  //   const subscription = AppState.addEventListener('change', handleAppStateChange);

  //   return () => {
  //     subscription.remove();
  //   };
  // }, [appState]);

  useEffect(() => {
    if (token != '') {
      const url = process.env.CHATWAVE_WEBSOCKET_URL;
      const ws: WebSocket = new WebSocket(url + token);

      ws.onopen = () => {
        console.log('WebSocket connected');
        // setConnection(true)
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessageQueue((prevQueue) => [...prevQueue, message]);
      };

      ws.onerror = (error) => {

        console.log("Connection Rejected")
        // ws.close();
        // setConnection(false);
        // setMessage({"user":"not exist"})
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // setConnection(false);
        // loadCredentials();

      };

      setSocket(ws);

      return () => {
        ws.close();
        // setConnection(false);
      };
    }
  }, [token]);

  useEffect(() => {
    if (messageQueue.length > 0) {
      // console.log(messageQueue)
      const processMessage = async () => {
        const message = messageQueue[0];
        // console.log(messageQueue)

        if (message["search_users"] || message["search_friend"]) {
          setSearch(message);
        }
        else if (message["notification"]) {
          setNotification(message)
          setTimeout(() => {
            setNotification({});
          }, 1000);
        }
        else if (message["profile_pic"]) {
          // console.log(message['uname']);
          setImage(message);
        }
        else if (message["gifs"]) {
          setGifs(message);
        }
        else {
          setMessage(message);
        }

        setMessageQueue((prevQueue) => prevQueue.slice(1));
      };

      const timer = setTimeout(processMessage, 10);  // 10ms delay

      return () => clearTimeout(timer);
    }
  }, [messageQueue]);

  // useEffect(() => {
  //   // if(connected){
  //   loadCredentials();
  //   // }
  // }, [])

  // console.log(connected)

  async function sendMessage(message: any) {
    // console.log(message);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
      return "sent";
    }
    else {
      console.log('WebSocket is not open');
      // const user = await storage.getItem("@username");
      // const pwd = await storage.getItem("@password");
      // console.log(user, pwd)
      // if(!(user && pwd)){  
      //   navigation.dispatch(StackActions.replace('Login'));
      // }

      // if (connected && socket && socket.readyState === WebSocket.CLOSED) {
      //   loadCredentials();
      //   setConnection(false);
      // }
      // if(connected==false)
      // {
      //   // socket.close();
      //   loadCredentials();
      //   setConnection(true);

      // }
      // if (socket && socket.readyState === WebSocket.CLOSED){
      //   setTimeout(loadCredentials, 1000);
      // }
    }
  };

  const loadCredentials = async () => {
    const user = await storage.getItem("@username");
    const pwd = await storage.getItem("@password");
    if (user && pwd) {
      // indicatorVisible(true)
      const response = await getResponse("auth", { "user": user, "pwd": pwd });
      // indicatorVisible(false)

      if (response["status"] == 'success') {
        setToken(response.token)
      }
      else {
        navigation.navigate('Login');
      }
    }
  }

  return (
    <WebSocketContext.Provider value={{ recvMessage, recvImage, recvGifs, search_res, recvNotify, setMessage, sendMessage }}>
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
