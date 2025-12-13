import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // ✅ Prevent blank screen while auth is resolving
  if (loading) {
    return <div>Loading...</div>;
  }

  // ✅ Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ SuperAdmin can access ALL routes
  if (user.role === "superadmin") {
    return children;
  }

  // ✅ If roles are specified, check access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // or "/unauthorized"
  }

  // ✅ Authorized normally
  return children;
}
