import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'famsync_token';
const USER_KEY = 'famsync_user';
const FAMILY_KEY = 'famsync_family';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistSession = async (nextToken, nextUser, nextFamily = null) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, nextToken],
      [USER_KEY, JSON.stringify(nextUser)],
      [FAMILY_KEY, JSON.stringify(nextFamily)]
    ]);
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setFamily(nextFamily);
  };

  const refreshProfile = async () => {
    if (!token) return;
    const { data } = await api.get('/family/me');
    setUser(data.user);
    setFamily(data.family);
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(data.user)],
      [FAMILY_KEY, JSON.stringify(data.family)]
    ]);
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    await persistSession(data.token, data.user);
  };

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    const me = await api.get('/family/me', {
      headers: { Authorization: `Bearer ${data.token}` }
    });

    await persistSession(data.token, me.data.user, me.data.family);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, FAMILY_KEY]);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setFamily(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const values = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY, FAMILY_KEY]);
        const loadedToken = values[0][1];
        const loadedUser = values[1][1];
        const loadedFamily = values[2][1];

        if (loadedToken && loadedUser) {
          setAuthToken(loadedToken);
          setToken(loadedToken);
          setUser(JSON.parse(loadedUser));
          setFamily(loadedFamily ? JSON.parse(loadedFamily) : null);

          try {
            const { data } = await api.get('/family/me');
            setUser(data.user);
            setFamily(data.family);
            await AsyncStorage.multiSet([
              [USER_KEY, JSON.stringify(data.user)],
              [FAMILY_KEY, JSON.stringify(data.family)]
            ]);
          } catch (error) {
            await logout();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      family,
      loading,
      register,
      login,
      logout,
      refreshProfile,
      setUser,
      setFamily
    }),
    [token, user, family, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
