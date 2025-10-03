import api from "./api";

export async function getAllMoviesRequest() {
    const res = await api.get("/api/movies");
    console.log(res.data);
    return res.data;
}

export async function getMovieByIdRequest(movieId) {
    const res = await api.get(`/api/movies/${movieId}`);
    return res.data;
}

export async function getHotMoviesRequest() {
    const res = await api.get("/api/movies/hot");
    return res.data;
}

export async function getUpcomingMoviesRequest() {
    const res = await api.get("/api/movies/upcoming");
    return res.data;
}

export async function createMovieRequest(movieData) {
    const res = await api.post("/api/movies", movieData);
    return res.data;
}

export async function updateMovieRequest(movieId, movieData) {
    const res = await api.put(`/api/movies/${movieId}`, movieData);
    return res.data;
}

export async function deleteMovieRequest(movieId) {
    const res = await api.delete(`/api/movies/${movieId}`);
    return res.data;
}

// ==========================
// 🔥 API cho ghế & đặt vé
// ==========================

export async function getSeatsByRoom(roomId) {
    const res = await api.get(`/api/seats/room/${roomId}`);
    return res.data;
}

export async function getSeatsByShowtime(showtimeId) {
    try {
        const res = await api.get(`/api/seats/showtime/${showtimeId}`);
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi API getSeatsByShowtime:", error);
        throw error;
    }
}

// ✅ sửa: dùng seatIds cho đúng với backend
export async function updateSeatSelection(seatIds, action) {
    const res = await api.post("/api/seats/select", { seatIds, action });
    return res.data.seats; // backend trả về { seats: [...] }
}

export async function createBooking(showtimeId, customerId, seatIds) {
    const res = await api.post("/api/bookings", {
        showtimeId,
        customerId,
        seatIds
    });
    return res.data;
}

export async function getShowtimeById(showtimeId) {
    const res = await api.get(`/api/showtimes/${showtimeId}`);
    return res.data;
}
