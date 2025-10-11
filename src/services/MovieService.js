import api from "./api";

export async function getAllMovies() {
    const res = await api.get("/api/movies");
    return res.data;
}


export async function getMovieById(movieId) {
    const res = await api.get(`/api/movies/${movieId}`);
    return res.data;
}

export async function getHotMovies() {
    const res = await api.get("/api/movies/hot");
    return res.data;
}

export async function getUpcomingMovies() {
    const res = await api.get("/api/movies/upcoming");
    return res.data;
}

export async function createMovie(movieData) {
    const res = await api.post("/api/movies", movieData);
    return res.data;
}

export async function updateMovie(movieId, movieData) {
    const res = await api.put(`/api/movies/${movieId}`, movieData);
    return res.data;
}

export async function deleteMovie(movieId) {
    const res = await api.delete(`/api/movies/${movieId}`);
    return res.data;
}


