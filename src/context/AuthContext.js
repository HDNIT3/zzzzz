import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { loginRequest, registerRequest, sendOtpRequest, verifyOtpRequest } from "../services/AuthService";

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

  const login = async (username, password, rememberMe = true) => {
    try {
      const token = await loginRequest(username, password);
      setToken(token);

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

  const sendOtp = async (email) => {
    try {
      const res = await sendOtpRequest(email);
      return res;
    } catch (err) {
      console.error("Send OTP failed:", err.message);
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await verifyOtpRequest(email, otp);
      return res;
    } catch (err) {
      console.error("Verify OTP failed:", err.message);
      throw err;
    }
  };

  useEffect(() => {
    const savedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, sendOtp, verifyOtp }}
    >
      {children}
    </AuthContext.Provider>
  );
}
