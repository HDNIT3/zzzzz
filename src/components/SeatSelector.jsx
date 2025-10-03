// src/components/SeatSelector.jsx
import React, { useState, useEffect } from "react";
import "../styles/seat-selector.css";
import { getSeatsByShowtime } from "../services/MovieService";

const SeatSelector = ({ showtimeId, onSelectSeats }) => {
    const [seats, setSeats] = useState([]);
    const [error, setError] = useState(null);

    // Chuẩn hóa seat từ BE -> FE
    const normalizeSeat = (s) => ({
        id: s.seatId,
        row: s.position?.split("-")[0] || "0",
        col: s.position?.split("-")[1] || "0",
        status: (s.status || "AVAILABLE").toLowerCase(), // "available", "occupied", "maintenance"
        price: s.price || 0
    });

    // Lấy dữ liệu ghế từ BE
    useEffect(() => {
        if (!showtimeId) {
            console.warn("❌ showtimeId không hợp lệ:", showtimeId);
            setSeats([]);
            setError("showtimeId không hợp lệ.");
            return;
        }
        setError(null);

        const fetchSeats = async () => {
            try {
                console.log("📡 Gọi API với showtimeId:", showtimeId);
                const fetchedSeats = await getSeatsByShowtime(showtimeId);
                console.log("✅ Dữ liệu ghế từ API:", fetchedSeats);

                if (!fetchedSeats || !Array.isArray(fetchedSeats)) {
                    setSeats([]);
                    setError("Không tìm thấy dữ liệu ghế.");
                    return;
                }

                setSeats(fetchedSeats.map(normalizeSeat));
            } catch (error) {
                console.error("❌ Lỗi khi lấy dữ liệu ghế:", error);
                setSeats([]);
                setError(`Lỗi: ${error.message}`);
            }
        };
        fetchSeats();
    }, [showtimeId]);

    // Chỉ toggle FE (không gọi API vì DB không cho "selected")
    const handleSelect = (seatId) => {
        setSeats(prev =>
            prev.map(s =>
                s.id === seatId
                    ? {
                        ...s,
                        status:
                            s.status === "available"
                                ? "selected"
                                : s.status === "selected"
                                    ? "available"
                                    : s.status // giữ nguyên nếu occupied/maintenance
                    }
                    : s
            )
        );
    };

    // Truyền danh sách ghế đang selected cho parent
    useEffect(() => {
        const selected = seats.filter(s => s.status === "selected");
        onSelectSeats(selected);
    }, [seats, onSelectSeats]);

    return (
        <div className="seat-map">
            {error ? (
                <p className="error-message">{error}</p>
            ) : seats.length === 0 ? (
                <p>Đang tải dữ liệu ghế...</p>
            ) : (
                seats.map(seat => (
                    <div
                        key={seat.id}
                        className={`seat ${seat.status}`}
                        onClick={() => handleSelect(seat.id)}
                    >
                        {seat.row}-{seat.col}
                    </div>
                ))
            )}
        </div>
    );
};

export default SeatSelector;
