import api from "./api";

export const createBill = async (bookingId, paymentMethod) => {
  try {
    const payload = { bookingId, paymentMethod };
    const response = await api.post("/api/bills", payload);
    return response.data; 
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
};

export const getBillsByAccount = async (accountId) => {
  try {
    const response = await api.get(`/bills/account/${accountId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }
};
