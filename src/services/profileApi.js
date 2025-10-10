// src/services/profileApi.js
// Client riêng cho /api/profile/** (KHÔNG interceptor, KHÔNG Authorization)
import axios from "axios";

const plain = axios.create({
    baseURL: "http://localhost:8080",
});

// Lấy hồ sơ theo accountId
export const getProfile = async (accountId) => {
    const res = await plain.get("/api/profile/me", { params: { accountId } });
    return res.data;
};

// Lấy Top Favorites (unique movie, sort desc, limit)
export const getFavoritesTop = async (accountId, limit = 5) => {
    const res = await plain.get("/api/profile/favorites/top", {
        params: { accountId, limit },
    });
    return res.data;
};

// Upload avatar (multipart) -> BE -> Cloudinary
export const uploadAvatar = async (accountId, file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await plain.post("/api/profile/avatar/upload", form, {
        params: { accountId },
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // { imageUrl: "..." }
};
