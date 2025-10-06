import { useEffect, useState } from "react";
import {
    getShowtimesForNext7DaysRequest,
    getShowtimesByDateRequest,
} from "../services/ShowtimeService";
import { getMovieByIdRequest } from "../services/MovieService";

export function useShowtimes(movieId) {
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [filteredShowtimes, setFilteredShowtimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emptyMessage, setEmptyMessage] = useState("");

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    };

    useEffect(() => {
        if (!movieId) return;
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [movieData, showtimeData] = await Promise.all([
                    getMovieByIdRequest(movieId),
                    getShowtimesForNext7DaysRequest(movieId),
                ]);

                setMovie(movieData);
                setShowtimes(showtimeData);

                if (showtimeData.length > 0) {
                    const today = new Date();
                    const todayStr = formatDate(today);
                    setSelectedDate(todayStr);
                    setFilteredShowtimes(
                        showtimeData.filter((st) => formatDate(st.startTime) === todayStr)
                    );
                    setEmptyMessage("");
                } else {
                    setFilteredShowtimes([]);
                    setEmptyMessage("No showtimes available for the next 7 days.");
                }
            } catch (err) {
                console.error("Error fetching showtimes:", err);
                setError("Failed to load showtimes. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [movieId]);

    // 🔹 Handle date selection
    const handleDateSelect = async (date) => {
        const dateStr = formatDate(date);
        setSelectedDate(dateStr);
        setLoading(true);
        setError(null);
        setEmptyMessage("");

        try {
            const showtimeData = await getShowtimesByDateRequest(movieId, dateStr);

            if (showtimeData && showtimeData.length > 0) {
                setFilteredShowtimes(showtimeData);
                setEmptyMessage("");
            } else {
                setFilteredShowtimes([]);
                setEmptyMessage("No showtimes available for this date.");
            }
        } catch (err) {
            console.error("Error fetching showtimes by date:", err);

            // ✅ Nếu lỗi 404 hoặc không có response, coi như không có suất chiếu
            if (err.response?.status === 404) {
                setFilteredShowtimes([]);
                setEmptyMessage("No showtimes available for this date.");
            } else {
                setFilteredShowtimes([]);
                setEmptyMessage("");
                setError("Failed to load showtimes for the selected date.");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        movie,
        filteredShowtimes,
        selectedDate,
        loading,
        error,
        emptyMessage,
        handleDateSelect,
        formatDate,
    };
}
