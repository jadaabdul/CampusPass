import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

import api from "./api/axios";
import { loginSuccess, logout } from "./redux/authSlice";
import AppRoutes from "./routes/appRoutes";
import { ThemeProvider } from "./utils/ThemeContext";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        dispatch(
          loginSuccess({
            token,
            user: response.data.data,
          })
        );
      } catch (error) {
        localStorage.removeItem("token");
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-text">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="font-semibold text-text-muted">Loading CampusPass...</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-surface-base)",
              color: "var(--color-text-base)",
              border: "1px solid var(--color-border-base)",
            },
          }}
        />
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
