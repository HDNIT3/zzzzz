import api from "./api";

export async function getShowtimesForNext7Days(movieId) {
    const res = await api.get(`/api/showtime/movie/${movieId}/next7days`);
    return res.data;
}

export async function getAllShowtimesForNext14Days() {
    const res = await api.get('/api/showtime/next14days');
    return res.data;
}

export async function getSeatsByShowtime(showtimeId) {
    const res = await api.get(`/api/showtime/${showtimeId}/seats`);
    return res.data;
}

export async function getShowtimeById(showtimeId) {
    const res = await api.get(`/api/showtime/${showtimeId}`);
    return res.data;
}

export async function createShowtime(showtimeData) {
    const res = await api.post('/api/showtime', showtimeData);
    return res.data;
}

export async function updateShowtime(showtimeId, showtimeData) {
    const res = await api.put(`/api/showtime/${showtimeId}`, showtimeData);
    return res.data;
}

export async function deleteShowtime(showtimeId) {
    const res = await api.delete(`/api/showtime/${showtimeId}`);
    return res.data;
}

export async function getAllRooms() {
    const res = await api.get('/api/rooms');
    return res.data;
}

/**
 * Update seat status
 */
export async function updateSeatStatus(seatId, status) {
  const res = await api.put(`/api/seats/${seatId}/status`, { status });
  return res.data;
}

/**
 * Lock multiple seats temporarily
 */
export async function lockSeats(seatIds) {
  const res = await api.post("/api/seats/lock", { seatIds });
  return res.data;
}

/**
 * Release locked seats
 */
export async function releaseSeats(seatIds) {
  const res = await api.post("/api/seats/release", { seatIds });
  return res.data;
}

/**
 * Check if seats are still available
 */
export async function checkSeatsAvailability(seatIds) {
  const res = await api.post("/api/seats/check-availability", { seatIds });
  return res.data;
}