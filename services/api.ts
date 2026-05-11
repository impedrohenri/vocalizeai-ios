import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_API_KEY } = Constants.expoConfig?.extra || process.env;

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

const tryAutoLogin = async (): Promise<string | null> => {
  try {
    const savedEmail = await AsyncStorage.getItem("saved_email");
    const savedPassword = await AsyncStorage.getItem("saved_password");
    
    if (!savedEmail || !savedPassword) {
      return null;
    }

    const response = await axios.post(`${EXPO_PUBLIC_API_URL}/auth/login`, {
      email: savedEmail,
      senha: savedPassword
    }, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": EXPO_PUBLIC_API_KEY,
      }
    });

    const { access_token, refresh_token } = response.data;

    await AsyncStorage.multiSet([
      ["access_token", access_token],
      ["refresh_token", refresh_token]
    ]);

    return access_token;
  } catch (error) {
    return null;
  }
};

export const api = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": EXPO_PUBLIC_API_KEY,
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem("access_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
          return Promise.reject(error);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
              refresh_token: refreshToken
            }, {
              headers: {
                "Content-Type": "application/json",
                "X-API-Key": EXPO_PUBLIC_API_KEY,
              }
            });

            const { access_token, refresh_token: new_refresh_token } = response.data;

            await AsyncStorage.multiSet([
              ["access_token", access_token],
              ["refresh_token", new_refresh_token]
            ]);

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            processQueue(null, access_token);
            
            return api(originalRequest);
          } catch (refreshError: any) {
            const newAccessToken = await tryAutoLogin();
            
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              processQueue(null, newAccessToken);
              
              Toast.show({
                type: "info",
                text1: "Sessão renovada",
                text2: "Login realizado automaticamente",
              });
              
              return api(originalRequest);
            }
          }
        } else {
          const newAccessToken = await tryAutoLogin();
          
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            
            Toast.show({
              type: "info",
              text1: "Sessão renovada", 
              text2: "Login realizado automaticamente",
            });
            
            return api(originalRequest);
          }
        }

        processQueue(error, null);
        
        await AsyncStorage.multiRemove([
          "access_token", 
          "refresh_token", 
          "token", 
          "tokenExpires", 
          "role", 
          "userId",
          "saved_email",
          "saved_password"
        ]);
        
        router.push("/auth/login");
        
        return Promise.reject(error);
      } catch (generalError) {
        processQueue(generalError, null);
        return Promise.reject(generalError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const apiPublic = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": EXPO_PUBLIC_API_KEY,
  },
});