import { useState, useEffect } from 'react';

export interface StorageType {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const useStorage = (): StorageType => {
  const [storage] = useState<StorageType>({
    getItem: async (key: string) => localStorage.getItem(key),
    setItem: async (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: async (key: string) => localStorage.removeItem(key),
  });

  return storage;
};

export default useStorage;

