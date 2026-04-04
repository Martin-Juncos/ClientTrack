import { Navigate, useLocation } from "react-router-dom";
import { LoaderPanel } from "../ui/LoaderPanel.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <LoaderPanel label="Preparando tu espacio comercial..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
