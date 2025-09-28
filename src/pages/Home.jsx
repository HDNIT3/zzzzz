import "../styles/home.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMovies } from "../hooks/useMovies";

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { hotMovies, upcomingMovies, loading } = useMovies();

    const navigateBooking = () => {
        navigate("/mov-bok");
    };

    if (loading) return <p>Loading movies...</p>;

    return (
        <div className="home-wrapper">
            {/* Hot movies */}
            <div className="hot-mov-list movie-list hot-movies">
                <div className="section-header">
                    <h2>🔥 Hot Movies</h2>
                    <p>Movies that are currently popular</p>
                </div>
                <div className="movie-carousel">
                    <div className="movie-track">
                        {Array.isArray(hotMovies) && hotMovies.map((movie) => (
                            <div className="movie-card" key={movie.movieId}>
                                <div
                                    className="movie-poster"
                                    style={{ backgroundImage: `url(${movie.posterUrl})` }}
                                ></div>
                                <div className="movie-info">
                                    <div className="movie-title">{movie.title}</div>
                                    <div className="movie-genre">{movie.genres?.join(", ")}</div>
                                    <div className="movie-rating">⭐ {movie.rating}/10</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming movies */}
            <div className="upcoming-mov-list movie-list upcoming-movies">
                <div className="section-header">
                    <h2>⭐ Coming Soon</h2>
                    <p>Movies that are coming soon</p>
                </div>
                <div className="movie-carousel">
                    <div className="movie-track">
                        {Array.isArray(upcomingMovies) && upcomingMovies.map((movie) => (
                            <div className="movie-card" key={movie.movieId}>
                                <div
                                    className="movie-poster"
                                    style={{ backgroundImage: `url(${movie.posterUrl})` }}
                                ></div>
                                <div className="movie-info">
                                    <div className="movie-title">{movie.title}</div>
                                    <div className="movie-genre">{movie.genres?.join(", ")}</div>
                                    <div className="movie-rating">
                                        🗓️ {new Date(movie.releaseDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {user?.role === "CUSTOMER" && (
                <div className="booking-nav">
                    <button onClick={navigateBooking}>🎟️ Đặt Vé Ngay</button>
                </div>
            )}
        </div>
    );
}