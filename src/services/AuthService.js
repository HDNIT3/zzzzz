import api from "./api";

export async function loginRequest(username, password) {
  const res = await api.post("/auth/login", { username, password });
  return res.data; 
}

export async function registerRequest(userData) {
  const res = await api.post("/auth/register", userData);
  return res.data; 
}

export async function sendOtpRequest(email) {
  const res = await api.post("/api/otp/send", { email });
  return res.data;
}

export async function verifyOtpRequest(email, otp) {
  const res = await api.post("/api/otp/verify", { email, otp });
  return res.data;
}
