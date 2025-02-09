import React, { createContext, useState, useContext } from 'react';
import { ImageSourcePropType } from 'react-native';

type UserContextType = {
  UName: string;
  setUName: (name: string) => void;
  token: string;
  setToken: (name: string) => void;
  profilephoto: ImageSourcePropType;
  setProfilephoto: (photo: ImageSourcePropType) => void;
};

const userContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children } : any) => {
  const [token, setToken] = useState('');
  const [UName, setUName] = useState('');
  const [profilephoto, setProfilephoto] = useState(require('@/assets/profiles/images/default.png'))
  return (
    <userContext.Provider value={{UName, setUName, token, setToken, profilephoto, setProfilephoto}}>
      {children}
    </userContext.Provider>
  ); 
};

export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

