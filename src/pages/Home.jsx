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
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const { hotMovies, upcomingMovies, loading } = useMovies();

  const handleCardClick = (movie) => {
    if (!user) {
      openLoginModal();
    } else {
      navigate(`/booking/${movie.movieId}`);
    }
  };
  const navigateBooking = () => {
    navigate("/mov-bk");
  };

  if (loading) return <p>Loading movies...</p>;

  const renderMovies = (movies, isUpcoming = false) => {
    return [...movies, ...movies].map((movie, idx) => {
      const fileName = movie.posterUrl.split("/").pop();
      const posterSrc = posters[fileName] || movie.posterUrl;

      return (
        <div
          className="home-movie-card"
          key={movie.movieId + "-" + idx}
          onClick={() => handleCardClick(movie)}
        >
          <div className="home-movie-poster">
            <img src={posterSrc} alt={movie.title} />
          </div>
          <div className="home-movie-info">
            <div className="home-movie-title">{movie.title}</div>
            <div className="home-movie-genre">{movie.genres?.join(", ")}</div>
            <div className="home-movie-rating">
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
      <div className="home-hot-mov-list home-movie-list home-hot-movies">
        <div className="home-section-header">
          <h2>🔥 Hot Movies</h2>
          <p>Movies that are currently popular</p>
        </div>
        <div className="home-movie-carousel">
          <div className="home-movie-track">
            {Array.isArray(hotMovies) && renderMovies(hotMovies)}
          </div>
        </div>
      </div>

      {/* Upcoming movies */}
      <div className="home-upcoming-mov-list home-movie-list home-upcoming-movies">
        <div className="home-section-header">
          <h2>⭐ Coming Soon</h2>
          <p>Movies that are coming soon</p>
        </div>
        <div className="home-movie-carousel">
          <div className="home-movie-track">
            {Array.isArray(upcomingMovies) &&
              renderMovies(upcomingMovies, true)}
          </div>
        </div>
      </div>

      {user?.role === "CUSTOMER" && (
        <div className="home-booking-nav">
          <button onClick={navigateBooking}>🎟️ Đặt Vé Ngay</button>
        </div>
      )}
    </div>
  );
}