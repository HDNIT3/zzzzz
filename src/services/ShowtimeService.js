import api from "./api";

export async function getShowtimesForNext7Days(movieId) {
    const res = await api.get(`/api/showtime/movie/${movieId}/next7days`);
    return res.data;
}

export async function getSeatsByShowtime(showtimeId) {
  try {
    const res = await api.get(`/api/showtime/${showtimeId}/seats`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getShowtimesByDate(movieId, date) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/date`, {
        params: { date }
    });
    return res.data;
}

export async function getShowtimeById(showtimeId) {
    const res = await api.get(`/api/showtime/${showtimeId}`);
    return res.data;
}

export async function getAvailableDates(movieId) {
    const res = await api.get(`/api/showtime/movie/${movieId}/available-dates`);
    return res.data;
}


export async function getAvailableLanguages(movieId) {
    const res = await api.get(`/api/showtime/movie/${movieId}/languages`);
    return res.data;
}