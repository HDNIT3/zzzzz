import "../styles/home.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navigateBooking = () => {
    navigate("/mov-bok"); 
  };

    return (
        <div class="home-wrapper">
            <div class="intro">
                <p>We bring you the ultimate movie experience with the latest blockbusters,
                    timeless classics, and exclusive events. Enjoy a modern booking system,
                    comfortable theaters, and premium services – all at your fingertips.</p>
            </div>

            <div class="hot-mov-list movie-list hot-movies">
                <div class="section-header">
                    <h2>🔥 Phim Hot</h2>
                    <p>Những bộ phim đang gây sốt tại rạp</p>
                </div>
                <div class="movie-carousel">
                    <div class="movie-track">

                        {/* Loop for movie cards (not implemented)*/}

                        {/* Movie Cards Placeholders */}
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Avengers: Endgame</div>
                                <div class="movie-genre">Hành Động, Sci-Fi</div>
                                <div class="movie-rating">⭐ 9.2/10</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Spider-Man: No Way Home</div>
                                <div class="movie-genre">Hành Động, Phiêu Lưu</div>
                                <div class="movie-rating">⭐ 8.8/10</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Top Gun: Maverick</div>
                                <div class="movie-genre">Hành Động, Drama</div>
                                <div class="movie-rating">⭐ 9.0/10</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Black Panther</div>
                                <div class="movie-genre">Hành Động, Sci-Fi</div>
                                <div class="movie-rating">⭐ 8.7/10</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Dune</div>
                                <div class="movie-genre">Sci-Fi, Drama</div>
                                <div class="movie-rating">⭐ 8.5/10</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Avengers: Endgame</div>
                                <div class="movie-genre">Hành Động, Sci-Fi</div>
                                <div class="movie-rating">⭐ 9.2/10</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Spider-Man: No Way Home</div>
                                <div class="movie-genre">Hành Động, Phiêu Lưu</div>
                                <div class="movie-rating">⭐ 8.8/10</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="upcoming-mov-list movie-list upcoming-movies">
                <div class="section-header">
                    <h2>⭐ Phim Sắp Chiếu</h2>
                    <p>Những bộ phim đáng mong chờ sắp ra mắt</p>
                </div>
                {/* Loop for movie cards (not implemented)*/}

                {/* Movie Cards Placeholders */}
                <div class="movie-carousel">
                    <div class="movie-track">
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Avatar 3</div>
                                <div class="movie-genre">Sci-Fi, Phiêu Lưu</div>
                                <div class="movie-rating">🗓️ 12/2025</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Fast X: Part 2</div>
                                <div class="movie-genre">Hành Động, Thriller</div>
                                <div class="movie-rating">🗓️ 03/2026</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Fantastic Four</div>
                                <div class="movie-genre">Hành Động, Sci-Fi</div>
                                <div class="movie-rating">🗓️ 07/2026</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Star Wars: New Hope</div>
                                <div class="movie-genre">Sci-Fi, Phiêu Lưu</div>
                                <div class="movie-rating">🗓️ 05/2026</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Mission Impossible 8</div>
                                <div class="movie-genre">Hành Động, Thriller</div>
                                <div class="movie-rating">🗓️ 11/2025</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Avatar 3</div>
                                <div class="movie-genre">Sci-Fi, Phiêu Lưu</div>
                                <div class="movie-rating">🗓️ 12/2025</div>
                            </div>
                        </div>
                        <div class="movie-card">
                            <div class="movie-poster"></div>
                            <div class="movie-info">
                                <div class="movie-title">Fast X: Part 2</div>
                                <div class="movie-genre">Hành Động, Thriller</div>
                                <div class="movie-rating">🗓️ 03/2026</div>
                            </div>
                        </div>
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