import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { LogOut, Menu, X, ChevronRight, Sun, Moon, Home, Calendar, Ticket, User, Bell, BellRing } from "lucide-react";

import api from "../api/axios";
import { logout } from "../redux/authSlice";
import NotificationBell from "../components/NotificationBell";
import Logo from "../components/Logo";

import { getNavLinksByRole, getHomeRouteByRole } from "../constants/navigation";

import { getInitials } from "../utils/formatters";

import { useTheme } from "../utils/ThemeContext";

const SidebarLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isDark, toggleTheme } = useTheme();

  const { user } = useSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const getImageUrl = (imageData) => {
    if (!imageData) return "";
    if (typeof imageData === "string") {
      if (
        imageData.startsWith("http://") ||
        imageData.startsWith("https://") ||
        imageData.startsWith("blob:")
      ) {
        return imageData;
      }
      return `${api.defaults.baseURL}/${imageData.replace(/^\//, "")}`;
    }
    if (typeof imageData === "object") {
      if (imageData.url) return getImageUrl(imageData.url);
      if (imageData.secure_url) return imageData.secure_url;
      if (imageData.path) return getImageUrl(imageData.path);
    }
    return "";
  };

  const isActive = (path) => {
    if (path === "/home" || path === "/organizer/dashboard" || path === "/admin/dashboard") {
      return location.pathname === path;
    }

    if (path === "/browse" && (location.pathname.startsWith("/event/") || location.pathname.startsWith("/payment/"))) {
      return true;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    dispatch(logout());

    toast.success("Logged out successfully");

    navigate("/login", {
      replace: true,
    });
  };

  const links = getNavLinksByRole(user?.role);

  const homeRoute = getHomeRouteByRole(user?.role);

  const initials = getInitials(user?.fullName);

  const bottomNavLinks = links.slice(0, 4);

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "organizer":
        return "Organizer";
      case "student":
        return "Student";
      default:
        return "Student";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "organizer":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "student":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:h-full lg:border-r lg:border-border lg:bg-surface lg:backdrop-blur-xl lg:flex-shrink-0">
        <div
          onClick={() => navigate(homeRoute)}
          className="h-20 flex items-center justify-between px-6 border-b border-border cursor-pointer flex-shrink-0"
        >
          <div className="scale-75 origin-left">
            <Logo />
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase border ${getRoleColor(user?.role)}`}>
            {getRoleLabel(user?.role)}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {links.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition
                  ${active ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-text-muted hover:bg-primary/10 hover:text-text"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight size={16} />}
              </NavLink>
            );
          })}
        </div>

        <div className="border-t border-border p-4 space-y-3 flex-shrink-0">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 cursor-pointer hover:bg-surface"
          >
            <div className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-xl bg-primary text-white font-bold shrink-0">
              {user?.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user?.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user?.fullName}</p>
              <p className="truncate text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full lg:hidden">
        <header className="sticky top-0 z-40 h-20 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-extrabold text-lg">Welcome, {user?.fullName?.split(" ")[0]}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-border hover:bg-surface"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />
            <div
              onClick={() => navigate("/profile")}
              className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-xl bg-primary text-white font-bold cursor-pointer shrink-0"
            >
              {user?.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user?.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border px-2 py-1 flex items-center justify-around">
          {bottomNavLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition relative
                  ${active ? "text-primary" : "text-text-muted hover:text-text"}
                `}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}

          <NavLink
            to="/profile"
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition relative
              ${isActive ? "text-primary" : "text-text-muted hover:text-text"}
            `}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </NavLink>
        </nav>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:min-w-0 lg:h-full">
        <header className="sticky top-0 z-40 h-20 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-extrabold text-lg">Welcome, {user?.fullName?.split(" ")[0]}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-border hover:bg-surface"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />
            <div
              onClick={() => navigate("/profile")}
              className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-xl bg-primary text-white font-bold cursor-pointer shrink-0"
            >
              {user?.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user?.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-8">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 pr-4 lg:pr-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
