import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextData>({
  token: null,
  setToken: () => {},
  loading: true,
});

export const AuthProvider: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
      } catch (error) {
        console.error('Erreur lors du chargement du token', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};