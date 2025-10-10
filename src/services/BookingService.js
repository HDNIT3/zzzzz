import api from "./api";

export async function getSeatsByRoom(roomId) {
  const res = await api.get(`/api/seats/room/${roomId}`);
  return res.data;
}

export async function getSeatsByShowtime(showtimeId) {
  try {
    const res = await api.get(`/api/seats/showtime/${showtimeId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching seats by showtime:", error);
    throw error;
  }
}

export async function updateSeatSelection(seatIds, action) {
  const res = await api.post("/api/seats/select", { seatIds, action });
  return res.data.seats;
}

export const createBooking = async (showtimeId, customerId, seatIds, serviceOrderId = null) => {
  try {
    const payload = { showtimeId, customerId, seatIds, serviceOrderId };

    const res = await api.post("/api/bookings", payload);
    return res.data; 
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    console.error("❌ Error response:", error.response?.data);
    throw error;
  }
};

export async function getShowtimeById(showtimeId) {
  const res = await api.get(`/api/showtimes/${showtimeId}`);
  return res.data;
}
