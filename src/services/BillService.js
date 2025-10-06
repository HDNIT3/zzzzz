import api from "./api"; // dùng axios instance có sẵn

export const getBillsByAccount = async (accountId) => {
  try {
    const response = await api.get(`/bills/account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }
};

export const createBill = async (accountId, showtimeId, totalAmount, billBody) => {
  try {
    const params = new URLSearchParams({
      accountId,
      showtimeId,
      totalAmount,
    });
    const response = await api.post(`/bills/create?${params.toString()}`, billBody);
    return response.data;
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
};
