import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { loginRequest, registerRequest } from "../services/AuthService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        console.log("Decoded token:", decoded);
      } catch (error) {
        console.error("Invalid Token");
        setUser(null);
        setToken(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const register = async (userData) => {
    try {
      const res = await registerRequest(userData);
      return res;
    } catch (err) {
      console.error("Registration failed:", err.message);
      throw err;
    }
  };

  const login = async (username, password, rememberMe) => {
    try {
      const token = await loginRequest(username, password);
      setToken(token);

      // Xóa trước để tránh lưu thừa
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      return token;
    } catch (err) {
      console.error("Login failed:", err.message);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
  };

  useEffect(() => {
    const savedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
