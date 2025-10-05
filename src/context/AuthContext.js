import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { loginRequest, sendOtpRequest, verifyOtpRequest } from "../services/AuthService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Khi token thay đổi, decode token
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.sub,
          role: decoded.role,
          accountId: decoded.user_id,
        });
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

  // Login
  const login = async (username, password, rememberMe = true) => {
    try {
      const token = await loginRequest(username, password);
      setToken(token);
      const decoded = jwtDecode(token);

      // Lưu vào đúng storage
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", decoded.sub);
        localStorage.setItem("role", decoded.role);
        localStorage.setItem("accountId", decoded.user_id);
        sessionStorage.clear();
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("username", decoded.sub);
        sessionStorage.setItem("role", decoded.role);
        sessionStorage.setItem("accountId", decoded.user_id);
        localStorage.clear();
      }

      return token;
    } catch (err) {
      console.error("Login failed:", err.message);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  // Send OTP
  const sendOtp = async (userData) => {
    try {
      const res = await sendOtpRequest(userData);
      console.log("OTP sent:", res);
      return res;
    } catch (err) {
      console.error("Send OTP failed:", err);
      if (err.response?.data?.errors) {
        throw new Error(JSON.stringify(err.response.data.errors));
      }
      throw err;
    }
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    try {
      const res = await verifyOtpRequest(email, otp);
      console.log("OTP verified and registered:", res);
      return res;
    } catch (err) {
      console.error("Verify OTP failed:", err);
      if (err.response?.data?.errors) {
        throw new Error(JSON.stringify(err.response.data.errors));
      }
      throw err;
    }
  };

  // Load token từ storage khi mount
  useEffect(() => {
    const savedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, sendOtp, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
}
