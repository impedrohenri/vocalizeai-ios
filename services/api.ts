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
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refresh_token: refreshToken
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

        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        await AsyncStorage.multiRemove([
          "access_token", 
          "refresh_token", 
          "token", 
          "tokenExpires", 
          "role", 
          "userId"
        ]);
        
        Toast.show({
          type: "error",
          text1: "Sessão expirada",
          text2: "Por favor, faça login novamente",
        });
        
        router.push("/auth/login");
        
        return Promise.reject(refreshError);
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
