import axios from "axios";
import Constants from "expo-constants";
import { storage } from "@/src/services/storage";

const getApiBaseUrl = () => {
  const configured =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl ||
    "http://localhost:8080/api";

  // Expo Go on physical devices often needs host-machine LAN IP instead of emulator loopback.
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any)?.expoGoConfig?.debuggerHost ||
    "";

  if (configured.includes("10.0.2.2") && hostUri) {
    const host = String(hostUri).split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return configured.replace("10.0.2.2", host);
    }
  }

  return configured;
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

let onUnauthorized: (() => Promise<void> | void) | null = null;

export const registerUnauthorizedHandler = (
  handler: (() => Promise<void> | void) | null
) => {
  onUnauthorized = handler;
};

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 && onUnauthorized) {
      await onUnauthorized();
    }
    return Promise.reject(error);
  }
);
