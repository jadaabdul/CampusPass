import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseURL = "http://10.223.62.39:3000/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;

    } catch (error) {
      console.log("Token error:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;