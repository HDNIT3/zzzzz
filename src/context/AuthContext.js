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
                console.log(decoded);
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

    const login = async (username, password) => {
        try {
            const token = await loginRequest(username, password);
            setToken(token);
            localStorage.setItem("token", token);
        } catch (err) {
            console.error("Login failed:", err.message);
        }
    };

    const logout = () => {
        setToken(null)
        localStorage.removeItem("token");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setToken(token);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}