import api from "./api";

export const getProfile = async (accountId) => {
  const res = await api.get("/api/profile/me", { params: { accountId } });
  return res.data;
};

export const updateBasic = async (accountId, body) => {
  const res = await api.post("/api/profile/me/update-basic", { accountId, ...body });
  return res.data;
};

export const getFavoritesTop = async (accountId, limit = 5) => {
  const res = await api.get("/api/profile/favorites/top", { params: { accountId, limit } });
  return res.data;
};

export const uploadAvatar = async (accountId, file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/api/profile/avatar/upload", form, {
    params: { accountId },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
