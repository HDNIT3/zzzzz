import api from "./api";

export async function getAllMoviesRequest() {
    const res = await api.get("/api/movies");
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


