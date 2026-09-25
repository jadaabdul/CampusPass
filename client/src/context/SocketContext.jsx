import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { incrementUnreadCount } from "../redux/notificationSlice";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Only connect if user is logged in
    if (user) {
      // Use the API URL base without /api, or fallback to localhost:5000
      const backendUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";
      const newSocket = io(backendUrl);

      setSocket(newSocket);

      newSocket.on("connect", () => {
        // Register the user with their ID to join their personal room
        newSocket.emit("register", user._id || user.id);
      });

      // Global listener for new notifications
      newSocket.on("newNotification", (notification) => {
        // Show toast
        toast.success(notification.title || "New Notification", {
          icon: "🔔",
          duration: 4000,
        });

        // Increment the global unread count badge in Redux
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dispatch]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
