import React, { useState, useEffect } from "react";
import "../styles/seat-selector.css";
import { getSeatsByShowtime } from "../services/BookingService";

const SeatSelector = ({ showtimeId, onSelectSeats }) => {
    const [seats, setSeats] = useState([]);
    const [error, setError] = useState(null);

    const normalizeSeat = (s) => ({
        id: s.seatId,
        row: s.position?.substring(0, 1) || "A",
        col: Number(s.position?.substring(1)) || 0,
        status: (s.status || "AVAILABLE").toLowerCase(), 
        price: s.price || 0,
        type: (s.type || "REGULAR").toLowerCase(), 
    });

    useEffect(() => {
        if (!showtimeId) {
            setSeats([]);
            setError("showtimeId không hợp lệ.");
            return;
        }
        setError(null);

        (async () => {
            try {
                const fetchedSeats = await getSeatsByShowtime(showtimeId);
                if (!Array.isArray(fetchedSeats)) {
                    setSeats([]);
                    setError("Không tìm thấy dữ liệu ghế.");
                    return;
                }
                setSeats(fetchedSeats.map(normalizeSeat));
            } catch (e) {
                console.error(e);
                setError(`Lỗi: ${e.message}`);
                setSeats([]);
            }
        })();
    }, [showtimeId]);

    const handleSelect = (seatId) => {
        setSeats((prev) =>
            prev.map((s) =>
                s.id === seatId
                    ? {
                        ...s,
                        status:
                            s.status === "available"
                                ? "selected"
                                : s.status === "selected"
                                    ? "available"
                                    : s.status,
                    }
                    : s
            )
        );
    };

    useEffect(() => {
        onSelectSeats(seats.filter((s) => s.status === "selected"));
    }, [seats, onSelectSeats]);

    const grouped = seats.reduce((acc, s) => {
        (acc[s.row] ||= []).push(s);
        return acc;
    }, {});
    const rows = Object.keys(grouped).sort(); 
    const maxCols = Math.max(0, ...seats.map((s) => s.col));

    return (
        <div className="seat-layout">
            <div className="screen">Screen</div>

            {error ? (
                <p className="error-message">{error}</p>
            ) : seats.length === 0 ? (
                <p className="loading-text">Đang tải dữ liệu ghế...</p>
            ) : (
                <div
                    className="seat-grid"
                    style={{ gridTemplateColumns: `40px repeat(${maxCols}, 40px)` }}
                >
                    {/* Header số cột */}
                    <div className="row-label" />
                    {Array.from({ length: maxCols }, (_, i) => (
                        <div key={`col-${i}`} className="col-label">
                            {i + 1}
                        </div>
                    ))}

                    {/* Từng hàng */}
                    {rows.map((r) => (
                        <React.Fragment key={r}>
                            <div className="row-label">{r}</div>
                            {Array.from({ length: maxCols }, (_, i) => {
                                const seat = grouped[r].find((s) => s.col === i + 1);
                                return seat ? (
                                    <button
                                        type="button"
                                        key={seat.id}
                                        className={`seat ${seat.status} ${seat.type}`}
                                        onClick={() =>
                                            seat.status !== "occupied" &&
                                            seat.status !== "maintenance" &&
                                            handleSelect(seat.id)
                                        }
                                        aria-label={`Seat ${r}${i + 1} - ${seat.status} - ${seat.type}`}
                                    />
                                ) : (
                                    <div
                                        key={`empty-${r}-${i}`}
                                        className="seat empty"
                                        aria-hidden="true"
                                    />
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="legend">
                <div className="legend-item">
                    <div className="seat available"></div>
                    <span>Ghế trống</span>
                </div>
                <div className="legend-item">
                    <div className="seat selected"></div>
                    <span>Đang chọn</span>
                </div>
                <div className="legend-item">
                    <div className="seat occupied"></div>
                    <span>Đã đặt</span>
                </div>
                <div className="legend-item">
                    <div className="seat maintenance"></div>
                    <span>Bảo trì</span>
                </div>
                <div className="legend-item">
                    <div className="seat available regular"></div>
                    <span>Ghế thường</span>
                </div>
                <div className="legend-item">
                    <div className="seat available vip"></div>
                    <span>Ghế VIP</span>
                </div>
                <div className="legend-item">
                    <div className="seat available pair"></div>
                    <span>Ghế đôi</span>
                </div>
            </div>

            <div className="entrances">
                <span>ENTRANCE</span>
                <span>EXIT</span>
                <span>ENTRANCE</span>
            </div>
        </div>
    );
};

export default SeatSelector;
