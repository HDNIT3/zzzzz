import api from "./api";

/**
 * Lấy tất cả suất chiếu của một phim trong 7 ngày tới
 */
export async function getShowtimesForNext7DaysRequest(movieId) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/next7days`);
    return res.data;
}

/**
 * Lấy suất chiếu của một phim theo ngày cụ thể
 * @param {string} movieId 
 * @param {string} date - Format: YYYY-MM-DD
 */
export async function getShowtimesByDateRequest(movieId, date) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/date`, {
        params: { date }
    });
    return res.data;
}

/**
 * Lấy thông tin một suất chiếu theo ID
 */
export async function getShowtimeByIdRequest(showtimeId) {
    const res = await api.get(`/api/showtimes/${showtimeId}`);
    return res.data;
}

/**
 * Lấy danh sách ngày có suất chiếu trong 7 ngày tới
 */
export async function getAvailableDatesRequest(movieId) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/available-dates`);
    return res.data;
}

/**
 * Lấy danh sách ngôn ngữ phụ đề có sẵn
 */
export async function getAvailableLanguagesRequest(movieId) {
    const res = await api.get(`/api/showtimes/movie/${movieId}/languages`);
    return res.data;
}