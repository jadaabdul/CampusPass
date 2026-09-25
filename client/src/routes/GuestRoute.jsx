import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestRoute = () => {
  const { token, user, isAuthenticated } = useSelector((state) => state.auth);

  if (!token && !isAuthenticated) {
    return <Outlet />;
  }

  if (!user) {
    return null;
  }

  const routeByRole = {
    admin: "/admin/dashboard",
    organizer: "/organizer/dashboard",
    student: "/home",
  };

  return <Navigate to={routeByRole[user.role] || "/"} replace />;
};

export default GuestRoute;