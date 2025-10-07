import React, { useState, useEffect } from "react";
import { useMovies } from "../hooks/useMovies";
import "../styles/movie-booking.css";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

const postersImport = require.context(
    "../assets/images/posters",
    false,
    /\.(png|jpe?g|svg)$/
);

const posters = {};
postersImport.keys().forEach((key) => {
    const fileName = key.replace("./", "");
    posters[fileName] = postersImport(key);
});

export function MovieBooking() {
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("all");
    const [selectedAge, setSelectedAge] = useState("all");
    const [selectedLanguage, setSelectedLanguage] = useState("all");

    const { movies, fetchAllMovies, loading, error } = useMovies();
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchAllMovies();
    }, []);

    const handleBooking = (movieId) => {
        console.log("Booking movie:", movieId);
        navigate(`/booking/${movieId}`);
    };

    const filteredMovies = movies.filter((movie) => {
        const matchSearch = movie.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchGenre =
            selectedGenre === "all" ||
            (movie.genres &&
                movie.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));

        const matchAge =
            selectedAge === "all" ||
            movie.ageRating?.toLowerCase() === selectedAge.toLowerCase();

        const matchLanguage =
            selectedLanguage === "all" ||
            (movie.languages &&
                movie.languages.some(
                    (lang) => lang.toLowerCase() === selectedLanguage.toLowerCase()
                ));

        return matchSearch && matchGenre && matchAge && matchLanguage;
    });

    const getCurrentDate = () => {
        const now = new Date();
        return now.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="movie-booking">
            {/* Header */}
            <header className="movie-booking-header">
                <div className="movie-booking-date-section">
                    <div className="movie-booking-calendar-icon">📅</div>
                    <span>{getCurrentDate()}</span>
                    <span>{getCurrentTime()}</span>
                </div>
                <h1 className="movie-booking-title">Movies</h1>
                <nav className="movie-booking-nav-buttons">
                    <button className="movie-booking-nav-button">Showtime</button>
                    <button className="movie-booking-nav-button active">Movie</button>
                </nav>
            </header>

            {/* Filters */}
            <section className="movie-booking-filters-section">
                {/* ... (phần code filter không thay đổi) ... */}
                <div className="movie-booking-search-box">
                    <span className="movie-booking-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search"
                        className="movie-booking-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="movie-booking-filter-group">
                    <label>Genre</label>
                    <select
                        className="movie-booking-filter-select"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="ACTION">Action</option>
                        <option value="ADVENTURE">Adventure</option>
                        <option value="ANIMATION">Animation</option>
                        <option value="COMEDY">Comedy</option>
                        <option value="CRIME">Crime</option>
                        <option value="DRAMA">Drama</option>
                        <option value="FANTASY">Fantasy</option>
                        <option value="HORROR">Horror</option>
                        <option value="MUSICAL">Musical</option>
                        <option value="ROMANCE">Romance</option>
                        <option value="SCI_FI">Sci-Fi</option>
                        <option value="THRILLER">Thriller</option>
                        <option value="WAR">War</option>
                        <option value="WESTERN">Western</option>
                    </select>
                </div>

                <div className="movie-booking-filter-group">
                    <label>Age</label>
                    <select
                        className="movie-booking-filter-select"
                        value={selectedAge}
                        onChange={(e) => setSelectedAge(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="P">P</option>
                        <option value="K">K</option>
                        <option value="T13">T13</option>
                        <option value="T16">T16</option>
                        <option value="T18">T18</option>
                        <option value="C">C</option>
                    </select>
                </div>

                <div className="movie-booking-filter-group">
                    <label>Language</label>
                    <select
                        className="movie-booking-filter-select"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="EN">English</option>
                        <option value="VI">Vietnamese</option>
                    </select>
                </div>
            </section>

            {/* Movies Grid */}
            <section className="movie-booking-movies-grid">
                {loading && <p>Loading movies...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {!loading && filteredMovies.length === 0 && <p>No movies found.</p>}

                {filteredMovies.map((movie) => {
                    const fileName = movie.posterUrl
                        ? movie.posterUrl.split("/").pop()
                        : null;
                    const posterSrc =
                        (fileName && posters[fileName]) ||
                        movie.posterUrl ||
                        "/fallback.jpg";

                    return (
                        <div key={movie.movieId} className="movie-booking-movie-card">
                            <img
                                src={posterSrc}
                                alt={movie.title}
                                className="movie-booking-movie-poster"
                            />
                            <h3 className="movie-booking-movie-title">{movie.title}</h3>
                            <div className="movie-booking-movie-details">
                                <div className="movie-booking-duration">
                                    <span className="movie-booking-clock-icon">🕐</span>
                                    {movie.duration} min
                                </div>
                                <div className="movie-booking-rating">
                                    {movie.rating === 0 ? "Upcoming" : movie.rating.toFixed(2)}
                                </div>
                            </div>

                            {movie.languages && movie.languages.length > 0 && (
                                <div className="movie-booking-languages">
                                    Languages: {movie.languages.join(", ")}
                                </div>
                            )}

                            <button
                                className="movie-booking-button"
                                onClick={() => handleBooking(movie.movieId)}
                            >
                                Booking
                            </button>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}