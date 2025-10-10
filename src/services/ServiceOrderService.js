import api from "./api";

export const createServiceOrder = async (accountId) => {
  const res = await api.post(`/api/service-orders/create`, null, {
    params: { accountId },
  });
  return res.data;
};

export const addServiceOrderDetails = async (orderId, details) => {
  const res = await api.post(`/api/service-orders/${orderId}/details`, details);
  return res.data;
};

export const getServiceOrderById = async (orderId) => {
  try {
    const res = await api.get(`/api/service-orders`, {
      params: { orderId }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching service order by ID:", error);
    throw error;
  }
};

export const deleteServiceOrder = async (orderId) => {
  try {
    const res = await api.delete(`/api/service-orders/${orderId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting service order:", error);
    throw error;
  }
};

export const deleteServiceOrderDetail = async (detailId) => {
  try {
    const res = await api.delete(`/api/service-orders/details/${detailId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting service order detail:", error);
    throw error;
  }
};