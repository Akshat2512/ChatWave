import React, { createContext, useState, useContext } from 'react';

type UserContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
};

const userContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children } : any) => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <userContext.Provider value={{token, setToken}}>
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

