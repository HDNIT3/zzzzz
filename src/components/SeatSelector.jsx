import React, { useState, useEffect, useMemo } from "react";
import "../styles/seat-selector.css";
import { getSeatsByShowtime } from "../services/BookingService";

export const SeatSelector = ({ showtimeId, onSelectSeats }) => {
  const [seatMap, setSeatMap] = useState({});
  const [error, setError] = useState(null);

  const normalizeSeat = (s) => ({
    id: s.seatId,
    row: s.position?.substring(0, 1) || "A",
    col: Number(s.position?.substring(1)) || 0,
    status: (s.status || "AVAILABLE").toLowerCase(),
    price: s.price || 0,
    type: (s.type || "REGULAR").toLowerCase(),
    lastUpdate: s.lastUpdate,
  });

  useEffect(() => {
    if (!showtimeId) {
      setSeatMap({});
      setError("Showtime not found.");
      return;
    }
    setError(null);

    (async () => {
      try {
        const fetchedSeats = await getSeatsByShowtime(showtimeId);
        if (!Array.isArray(fetchedSeats)) {
          setSeatMap({});
          setError("Seat not found.");
          return;
        }

        const map = {};
        fetchedSeats.forEach((s) => {
          const seat = normalizeSeat(s);
          map[seat.id] = seat;
        });
        setSeatMap(map);
      } catch (e) {
        console.error(e);
        setSeatMap({});
        setError(`error: ${e.message}`);
      }
    })();
  }, [showtimeId]);

  const handleSelect = (seatId) => {
    setSeatMap((prev) => {
      const seat = prev[seatId];
      if (!seat || seat.status === "occupied" || seat.status === "maintenance") return prev;

      return {
        ...prev,
        [seatId]: {
          ...seat,
          status: seat.status === "available" ? "locked" : "available",
        },
      };
    });
  };

  useEffect(() => {
    const selectedSeats = Object.values(seatMap).filter((s) => s.status === "locked");
    console.log("Selected seats:", selectedSeats);
    onSelectSeats(selectedSeats);
  }, [seatMap, onSelectSeats]);

  const { grouped, rows, maxCols } = useMemo(() => {
    const g = {};
    let maxCol = 0;
    Object.values(seatMap).forEach((s) => {
      g[s.row] ||= {};
      g[s.row][s.col] = s;
      if (s.col > maxCol) maxCol = s.col;
    });
    const r = Object.keys(g).sort();
    return { grouped: g, rows: r, maxCols: maxCol };
  }, [seatMap]);

  return (
    <div className="seat-layout">
      <div className="screen">Screen</div>

      {error ? (
        <p className="error-message">{error}</p>
      ) : Object.keys(seatMap).length === 0 ? (
        <p className="loading-text">Đang tải dữ liệu ghế...</p>
      ) : (
        <div className="seat-grid" style={{ gridTemplateColumns: `40px repeat(${maxCols}, 40px)` }}>
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
                const seat = grouped[r][i + 1];
                return seat ? (
                  <button
                    type="button"
                    key={seat.id}
                    className={`seat ${seat.status} ${seat.type}`}
                    onClick={() => handleSelect(seat.id)}
                    aria-label={`Seat ${r}${i + 1} - ${seat.status} - ${seat.type}`}
                  />
                ) : (
                  <div key={`empty-${r}-${i}`} className="seat empty" aria-hidden="true" />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Legend */}
      <SeatLegend />

      {/* Entrances */}
      <div className="entrances">
        <span>ENTRANCE</span>
        <span>EXIT</span>
        <span>ENTRANCE</span>
      </div>
    </div>
  );
};

const SeatLegend = React.memo(() => (
  <div className="legend">
    <div className="legend-item">
      <div className="seat available"></div>
      <span>Available</span>
    </div>
    <div className="legend-item">
      <div className="seat locked"></div>
      <span>Selecting</span>
    </div>
    <div className="legend-item">
      <div className="seat occupied"></div>
      <span>Occupied</span>
    </div>
    <div className="legend-item">
      <div className="seat maintenance"></div>
      <span>Mantenance</span>
    </div>
    <div className="legend-item">
      <div className="seat available regular"></div>
      <span>Regular</span>
    </div>
    <div className="legend-item">
      <div className="seat available vip"></div>
      <span>VIP</span>
    </div>
    <div className="legend-item">
      <div className="seat available pair"></div>
      <span>Couple</span>
    </div>
  </div>
));

