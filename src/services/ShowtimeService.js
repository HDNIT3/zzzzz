import api from "./api";

export async function getShowtimesForNext7DaysRequest(movieId) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/next7days`);
    return res.data;
}

export async function getShowtimesByDateRequest(movieId, date) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/date`, {
        params: { date }
    });
    return res.data;
}

export async function getShowtimeByIdRequest(showtimeId) {
    const res = await api.get(`/api/showtimes/${showtimeId}`);
    return res.data;
}

export async function getAvailableDatesRequest(movieId) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/available-dates`);
    return res.data;
}


export async function getAvailableLanguagesRequest(movieId) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/languages`);
    return res.data;
}