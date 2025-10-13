import api from "./api";

export async function getSeatsByRoom(roomId) {
  const res = await api.get(`/api/seats/room/${roomId}`);
  return res.data;
}

export async function updateSeatSelection(seatIds, status) {
  const res = await api.post("/api/seats/select", { seatIds, status });
  return res.data.seats;
}

export async function createBooking(showtimeId, customerId, seatIds, serviceOrderId = null) {
  try {
    const payload = { showtimeId, customerId, seatIds, serviceOrderId };
    const res = await api.post("/api/bookings", payload);
    return res.data; 
  } catch (error) {
    throw error;
  }
}

export async function getShowtimeById(showtimeId) {
  const res = await api.get(`/api/showtimes/${showtimeId}`);
  return res.data;
}
