import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { Alert } from "react-native";
import { incrementUnreadCount } from "../redux/notificationSlice";
import api from "../api/axios";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const backendUrl = api.defaults.baseURL?.replace("/api", "") || "http://localhost:3000";
      const newSocket = io(backendUrl, {
        transports: ["websocket"],
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("register", user._id || user.id);
      });

      newSocket.on("newNotification", (notification) => {
        Alert.alert("🔔 Notification", notification.title || "New Notification received");
        dispatch(incrementUnreadCount());
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user, dispatch]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
