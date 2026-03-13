import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "corehive_token";
const USER_KEY = "corehive_user";

export const storage = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  async saveUser(user: unknown) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async getUser<T>() {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async removeUser() {
    await AsyncStorage.removeItem(USER_KEY);
  },
  async clearAuth() {
    await Promise.all([this.removeToken(), this.removeUser()]);
  }
};
