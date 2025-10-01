import "../styles/home.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMovies } from "../hooks/useMovies";

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

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hotMovies, upcomingMovies, loading } = useMovies();

  const navigateBooking = () => {
    navigate("/mov-bk");
  };

  if (loading) return <p>Loading movies...</p>;

  const renderMovies = (movies, isUpcoming = false) => {
    return [...movies, ...movies].map((movie, idx) => {
        const fileName = movie.posterUrl.split("/").pop(); 
        const posterSrc = posters[fileName] || movie.posterUrl;

        return (
        <div className="movie-card" key={movie.movieId + "-" + idx}>
            <div className="movie-poster">
            <img src={posterSrc} alt={movie.title} />
            </div>
            <div className="movie-info">
            <div className="movie-title">{movie.title}</div>
            <div className="movie-genre">{movie.genres?.join(", ")}</div>
            <div className="movie-rating">
                {isUpcoming
                ? `🗓️ ${new Date(movie.releaseDate).toLocaleDateString()}`
                : `⭐ ${movie.rating === 0 ? "Upcoming" : movie.rating.toFixed(2)}`}
            </div>
            </div>
        </div>
        );
    });
    };


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
            {Array.isArray(hotMovies) && renderMovies(hotMovies)}
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
            {Array.isArray(upcomingMovies) &&
              renderMovies(upcomingMovies, true)}
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
