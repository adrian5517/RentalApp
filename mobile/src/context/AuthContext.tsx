import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

interface AuthContextData {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Use your local IP address
const API_URL = 'http://192.168.100.105:5000/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData(): Promise<void> {
    try {
      const storedUser = await AsyncStorage.getItem('@RNAuth:user');
      const storedToken = await AsyncStorage.getItem('@RNAuth:token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', { email });
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log('Sign in response:', response.data);
      const { token } = response.data;
      
      await AsyncStorage.setItem('@RNAuth:token', token);
      await AsyncStorage.setItem('@RNAuth:user', JSON.stringify(response.data.user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Sign in error:', error.response?.data || error.message);
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting to sign up with:', { name, email });
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });

      console.log('Sign up response:', response.data);
      const { token } = response.data;
      
      await AsyncStorage.setItem('@RNAuth:token', token);
      await AsyncStorage.setItem('@RNAuth:user', JSON.stringify(response.data.user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Sign up error:', error.response?.data || error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@RNAuth:token');
      await AsyncStorage.removeItem('@RNAuth:user');
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
