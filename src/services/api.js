import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "https://sdadasd-production.up.railway.app",  // Sử dụng env var
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

//deloy