import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ role }) => {
  const { token, user } = useSelector((state) => state.auth);
  

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wait until user data is available
  if (!user) {
    return null; // or a loading spinner
  }

  // Role doesn't match
  if (role && user.role !== role) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;

      case "organizer":
        return <Navigate to="/organizer/dashboard" replace />;

      default:
        return <Navigate to="/home" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;