// src/pages/SelectShowtime.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieByIdRequest } from "../services/MovieService";
import "../styles/showtime.css";

export function SelectShowtime() {
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                setLoading(true);
                const movieData = await getMovieByIdRequest(movieId);
                setMovie(movieData);
                setError(null);
            } catch (err) {
                setError("Không thể tải thông tin phim.");
                console.error("Fetch movie error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [movieId]);

    if (loading) return <div className="status">Đang tải thông tin phim...</div>;
    if (error) return <div className="status error">{error}</div>;
    if (!movie) return <div className="status">Không tìm thấy phim.</div>;

    return (
        <div className="select-showtime-page">
            <h2>Chọn suất chiếu cho: {movie.title}</h2>
            <p>Thời lượng: {movie.duration} phút</p>
            <div className="showtime-list">
                {movie.showtimes && movie.showtimes.length > 0 ? (
                    movie.showtimes.map((st) => (
                        <button
                            key={st.showtimeId}
                            className="showtime-btn"
                            onClick={() => navigate(`/booking/${movieId}/${st.showtimeId}`)}
                        >
                            {st.startTime} - {st.endTime}
                        </button>
                    ))
                ) : (
                    <p>Hiện chưa có suất chiếu nào.</p>
                )}
            </div>
        </div>
    );
}
