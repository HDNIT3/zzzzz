// src/pages/Booking.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieByIdRequest } from "../services/MovieService";
import "../styles/booking.css";
import {
    ChevronLeft, ChevronRight, Ticket, Popcorn, CreditCard,
    Clock, Star, Film, Shield
} from "lucide-react";

// === LOGIC XỬ LÝ ẢNH ĐÚNG (COPY TỪ MOVIE-BOOKING.JSX) ===
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
// ==========================================================

const TABS = ["Seats", "Services", "Payment"];

export function Booking() {
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                setLoading(true);
                const movieData = await getMovieByIdRequest(movieId);
                setMovie(movieData);
                setError(null);
            } catch (err) {
                setError("Không thể tải thông tin phim. Vui lòng thử lại.");
                console.error("Fetch movie error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [movieId]);

    const handleNextTab = () => {
        setActiveTabIndex((prevIndex) => Math.min(prevIndex + 1, TABS.length - 1));
    };

    const handleBackTab = () => {
        setActiveTabIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const renderTabContent = () => {
        const currentTab = TABS[activeTabIndex];
        if (currentTab === "Payment") {
            return (
                <div className="tab-content empty payment-tab-content">
                    <p>Phương thức thanh toán mặc định:</p>
                    <strong>Thẻ Ngân hàng / Ví MoMo</strong>
                    <p className="payment-note">Đặt vé online chỉ hỗ trợ thanh toán trả trước.</p>
                    <button className="payment-button final-payment-button" onClick={() => alert("Thanh toán thành công!")}>
                        <CreditCard size={20} />
                        Thanh Toán Ngay
                    </button>
                </div>
            );
        }
        return (
            <div className="tab-content empty"><p>Tính năng đang được phát triển.</p></div>
        );
    };

    if (loading) return <div className="booking-status">Đang tải thông tin phim...</div>;
    if (error) return <div className="booking-status error">{error}</div>;

    // === ÁP DỤNG LOGIC LẤY ẢNH ĐÚNG ===
    const getPosterSrc = (posterUrl) => {
        if (!posterUrl) return "/fallback.jpg"; // Ảnh dự phòng
        if (posterUrl.startsWith("http")) return posterUrl; // Nếu là URL đầy đủ

        // Lấy tên file từ posterUrl
        const fileName = posterUrl.split("/").pop();
        return posters[fileName] || "/fallback.jpg";
    };
    const finalPosterUrl = getPosterSrc(movie.posterUrl);
    // ===================================

    return (
        <div className="booking-page">
            <div className="booking-container">
                <div className="movie-summary">
                    <img
                        src={finalPosterUrl} // SỬ DỤNG finalPosterUrl ĐÃ XỬ LÝ
                        alt={movie.title}
                        className="summary-poster"
                    />
                    <h2 className="summary-title">{movie.title}</h2>
                    <p className="summary-info">Rạp: CinemUTE Thủ Đức</p>
                    <p className="summary-info">Suất chiếu: 20:00 - Hôm nay</p>

                    <div className="summary-details">
                        <div className="detail-item">
                            <Film size={16} />
                            <span>{movie.genres && movie.genres.join(', ')}</span>
                        </div>
                        <div className="detail-item">
                            <Clock size={16} />
                            <span>{movie.duration} phút</span>
                        </div>
                        <div className="detail-item">
                            <Star size={16} />
                            <span>{movie.rating.toFixed(1)}/10</span>
                        </div>
                        <div className="detail-item">
                            <Shield size={16} />
                            <span>Giới hạn tuổi: <span className="age-rating-badge">{movie.ageRating}</span></span>
                        </div>
                    </div>

                    <div className="summary-total">
                        <h4>TẠM TÍNH</h4>
                        <p>120.000đ</p>
                    </div>
                </div>

                <div className="booking-details">
                    <div className="booking-header">
                        <button className="back-button" onClick={() => navigate("/mov-bk")}>
                            <ChevronLeft size={24} />
                            <span>Quay lại trang chọn phim</span>
                        </button>
                    </div>
                    <div className="booking-tabs">
                        <div className={`tab-item ${activeTabIndex >= 0 ? "active" : ""}`}>
                            <Ticket /><span>01. CHỌN GHẾ</span>
                        </div>
                        <div className={`tab-item ${activeTabIndex >= 1 ? "active" : ""}`}>
                            <Popcorn /><span>02. CHỌN DỊCH VỤ</span>
                        </div>
                        <div className={`tab-item ${activeTabIndex >= 2 ? "active" : ""}`}>
                            <CreditCard /><span>03. THANH TOÁN</span>
                        </div>
                    </div>
                    <div className="tab-content-container">{renderTabContent()}</div>

                    <div className="tab-navigation">
                        <button onClick={handleBackTab} disabled={activeTabIndex === 0}>
                            <ChevronLeft size={16} />Quay lại
                        </button>
                        <button onClick={handleNextTab} disabled={activeTabIndex === TABS.length - 1}>
                            Tiếp theo<ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}