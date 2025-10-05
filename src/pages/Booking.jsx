import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieByIdRequest } from "../services/MovieService";
import { createBooking } from "../services/BookingService";
import "../styles/booking.css";
import {
    ChevronLeft,
    ChevronRight,
    Ticket,
    Popcorn,
    CreditCard,
    Clock,
    Star,
    Film,
    Shield
} from "lucide-react";
import SeatSelector from "../components/SeatSelector";

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

const TABS = ["Seats", "Services", "Payment"];

export function Booking() {
    const { movieId, showtimeId } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showtime, setShowtime] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                setLoading(true);
                const movieData = await getMovieByIdRequest(movieId);
                setMovie(movieData);

                const st = movieData.showtimes.find(
                    (s) => s.showtimeId === showtimeId
                );
                setShowtime(st);

                setError(null);
            } catch (err) {
                setError("Failed to load movie information. Please try again.");
                console.error("Fetch movie error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [movieId, showtimeId]);


    const handleNextTab = () => {
        if (activeTabIndex === 0 && selectedSeats.length === 0) {
            alert("Please select at least one seat!");
            return;
        }
        setActiveTabIndex((prevIndex) => Math.min(prevIndex + 1, TABS.length - 1));
    };

    const handleBackTab = () => {
        setActiveTabIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const handlePayment = async () => {
        const userId =
            sessionStorage.getItem("user_id") || localStorage.getItem("user_id");
        try {
            const booking = await createBooking(
                showtimeId,
                userId,
                selectedSeats.map((seat) => seat.seatId)
            );
            alert(`Booking successful! Booking ID: ${booking.bookingId}`);
            navigate("/mov-bk");
        } catch (err) {
            console.error("Payment error:", err);
            setError("Payment failed. Please try again.");
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    const renderTabContent = () => {
        const currentTab = TABS[activeTabIndex];
        if (currentTab === "Seats") {
            return (
                <div className="tab-content">
                    <h3>Select Seats</h3>
                    <SeatSelector
                        showtimeId={showtimeId}
                        onSelectSeats={setSelectedSeats}
                    />
                    <p>Selected seats: {selectedSeats.length}</p>
                    <p>
                        Total Price: {totalPrice.toLocaleString()} $
                    </p>
                </div>
            );
        }
        if (currentTab === "Payment") {
            return (
                <div className="tab-content empty payment-tab-content">
                    <p>Default payment method:</p>
                    <strong>Bank Card / MoMo Wallet</strong>
                    <p className="payment-note">
                        Online booking only supports prepayment.
                    </p>
                    <button
                        className="payment-button final-payment-button"
                        onClick={handlePayment}
                    >
                        <CreditCard size={20} />
                        Pay Now
                    </button>
                </div>
            );
        }
        return (
            <div className="tab-content empty">
                <p>Feature under development.</p>
            </div>
        );
    };

    if (loading)
        return <div className="booking-status">Loading movie information...</div>;
    if (error) return <div className="booking-status error">{error}</div>;

    const getPosterSrc = (posterUrl) => {
        if (!posterUrl) return "/fallback.jpg";
        if (posterUrl.startsWith("http")) return posterUrl;
        const fileName = posterUrl.split("/").pop();
        return posters[fileName] || "/fallback.jpg";
    };
    const finalPosterUrl = getPosterSrc(movie.posterUrl);

    return (
        <div className="booking-page">
            <div className="booking-container">
                {/* movie summary */}
                <div className="movie-summary">
                    <img
                        src={finalPosterUrl}
                        alt={movie.title}
                        className="summary-poster"
                    />
                    <h2 className="summary-title">{movie.title}</h2>
                    <p className="summary-info">Cinema: CinemUTE Thu Duc</p>
                    <p className="summary-info">Showtime: 20:00 - Today</p>
                    <p className="summary-info">{showtime?.room?.name || "N/A"}</p>
                    <div className="summary-details">
                        <div className="detail-item">
                            <Film size={16} />
                            <span>{movie.genres && movie.genres.join(", ")}</span>
                        </div>
                        <div className="detail-item">
                            <Clock size={16} />
                            <span>{movie.duration} minutes</span>
                        </div>
                        <div className="detail-item">
                            <Star size={16} />
                            <span>{movie.rating.toFixed(1)}/10</span>
                        </div>
                        <div className="detail-item">
                            <Shield size={16} />
                            <span>
                                Age limit:{" "}
                                <span className="age-rating-badge">{movie.ageRating}</span>
                            </span>
                        </div>
                    </div>
                    <div className="summary-total">
                        <h4>SUBTOTAL</h4>
                        <p>{totalPrice.toLocaleString()} $</p>
                    </div>
                </div>

                {/* booking details */}
                <div className="booking-details">
                    <div className="booking-header">
                        <button
                            className="back-button"
                            onClick={() => navigate("/mov-bk")}
                        >
                            <ChevronLeft size={24} />
                            <span>Back to movie selection</span>
                        </button>
                    </div>
                    <div className="booking-tabs">
                        <div className={`tab-item ${activeTabIndex >= 0 ? "active" : ""}`}>
                            <Ticket />
                            <span>01. SELECT SEATS</span>
                        </div>
                        <div className={`tab-item ${activeTabIndex >= 1 ? "active" : ""}`}>
                            <Popcorn />
                            <span>02. SELECT SERVICES</span>
                        </div>
                        <div className={`tab-item ${activeTabIndex >= 2 ? "active" : ""}`}>
                            <CreditCard />
                            <span>03. PAYMENT</span>
                        </div>
                    </div>
                    <div className="tab-content-container">{renderTabContent()}</div>
                    <div className="tab-navigation">
                        <button onClick={handleBackTab} disabled={activeTabIndex === 0}>
                            <ChevronLeft size={16} />
                            Back
                        </button>
                        <button
                            onClick={handleNextTab}
                            disabled={activeTabIndex === TABS.length - 1}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
