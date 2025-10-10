import api from "./api";

export const createBill = async (data) => {
  try {
    const response = await api.post("/api/bills", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating bill:", error);
    throw error.response?.data || { message: "Bill creation failed" };
  }
};

export const getBillsByAccount = async (accountId) => {
  try {
    const response = await api.get(`/api/bills/account/${accountId}`);
    
    return response.data; 
  } catch (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }
};