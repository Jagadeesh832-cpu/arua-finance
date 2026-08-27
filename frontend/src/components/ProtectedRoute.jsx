import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/helper/auth";
import { Loader2 } from "lucide-react";

/**
 * Higher Order Component to protect private application views
 */
const ProtectedRoute = ({ children }) => {
  const { user, LoggedInUserData, FirstLoader, openAuthModal } = useAuth();
  const location = useLocation();

  const isAuthenticated = Boolean(
    user ||
    LoggedInUserData ||
    localStorage.getItem("arua_auth_token") ||
    localStorage.getItem("arua_user_phone") ||
    localStorage.getItem("arua_user_email")
  );

  useEffect(() => {
    if (!FirstLoader && !isAuthenticated) {
      openAuthModal("signin");
    }
  }, [FirstLoader, isAuthenticated]);

  if (FirstLoader) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
          Authenticating Secure Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
