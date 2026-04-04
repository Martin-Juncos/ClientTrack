import { useCallback, useEffect, useState } from "react";
import { authApi } from "../lib/api/authApi.js";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  const refreshSession = useCallback(async () => {
    try {
      const response = await authApi.me();
      setUser(response.user);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  async function login(credentials) {
    const response = await authApi.login(credentials);
    setUser(response.user);
    setStatus("authenticated");
    return response.user;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("guest");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated: status === "authenticated",
        login,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
