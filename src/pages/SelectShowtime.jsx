import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieByIdRequest } from "../services/MovieService";
import { getShowtimesForNext7DaysRequest, getShowtimesByDateRequest } from "../services/ShowtimeService";
import "../styles/showtime.css";

export function SelectShowtime() {
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [allShowtimes, setAllShowtimes] = useState([]);
    const [filteredShowtimes, setFilteredShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    // Tạo danh sách 7 ngày (hôm nay + 6 ngày tiếp theo)
    const getNext7Days = () => {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        
        return dates;
    };

    const next7Days = getNext7Days();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Lấy thông tin phim
                const movieData = await getMovieByIdRequest(movieId);
                setMovie(movieData);
                
                // Lấy tất cả suất chiếu trong 7 ngày tới
                const showtimesData = await getShowtimesForNext7DaysRequest(movieId);
                setAllShowtimes(showtimesData);
                
                // Mặc định chọn ngày hôm nay
                const today = formatDate(new Date());
                setSelectedDate(today);
                
                // Lọc suất chiếu cho ngày hôm nay
                filterShowtimesByDate(showtimesData, today);
                
                setError(null);
            } catch (err) {
                setError("Không thể tải thông tin. Vui lòng thử lại.");
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [movieId]);

    // Format ngày thành YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format hiển thị ngày (VD: Thứ 2, 05/10)
    const formatDisplayDate = (date) => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = days[date.getDay()];
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        const today = new Date();
        if (formatDate(date) === formatDate(today)) {
            return `Hôm nay, ${day}/${month}`;
        }
        
        return `${dayName}, ${day}/${month}`;
    };

    // Lọc suất chiếu theo ngày
    const filterShowtimesByDate = (showtimes, dateStr) => {
        const filtered = showtimes.filter(st => {
            if (!st.startTime) return false;
            
            const showtimeDate = new Date(st.startTime);
            const showtimeDateStr = formatDate(showtimeDate);
            
            return showtimeDateStr === dateStr;
        });
        
        setFilteredShowtimes(filtered);
    };

    // Xử lý khi chọn ngày
    const handleDateSelect = async (date) => {
        const dateStr = formatDate(date);
        setSelectedDate(dateStr);
        
        // Có thể gọi API mới để lấy suất chiếu theo ngày cụ thể
        // hoặc lọc từ danh sách đã có
        try {
            const showtimesData = await getShowtimesByDateRequest(movieId, dateStr);
            setFilteredShowtimes(showtimesData);
        } catch (err) {
            // Nếu API lỗi, lọc từ danh sách có sẵn
            filterShowtimesByDate(allShowtimes, dateStr);
        }
    };

    // Format thời gian hiển thị (VD: 10:30)
    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    if (loading) return <div className="select-showtime-status">Đang tải thông tin...</div>;
    if (error) return <div className="select-showtime-status error">{error}</div>;
    if (!movie) return <div className="select-showtime-status">Không tìm thấy phim.</div>;

    return (
        <div className="select-showtime-page">
            <div className="select-showtime-movie-header">
                <h2>Chọn suất chiếu: {movie.title}</h2>
                <p className="select-showtime-movie-duration">Thời lượng: {movie.duration} phút</p>
            </div>

            {/* Bộ lọc ngày */}
            <div className="select-showtime-date-filter">
                <h3>Chọn ngày:</h3>
                <div className="select-showtime-date-buttons">
                    {next7Days.map((date, index) => {
                        const dateStr = formatDate(date);
                        return (
                            <button
                                key={index}
                                className={`select-showtime-date-btn ${selectedDate === dateStr ? 'active' : ''}`}
                                onClick={() => handleDateSelect(date)}
                            >
                                {formatDisplayDate(date)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Danh sách suất chiếu */}
            <div className="select-showtime-section">
                <h3>Suất chiếu ngày {selectedDate}:</h3>
                <div className="select-showtime-list">
                    {filteredShowtimes.length > 0 ? (
                        filteredShowtimes.map((st) => (
                            <button
                                key={st.showtimeId}
                                className="select-showtime-btn"
                                onClick={() => navigate(`/booking/${movieId}/${st.showtimeId}`)}
                            >
                                <div className="select-showtime-time">
                                    {formatTime(st.startTime)}
                                </div>
                                {st.language && (
                                    <div className="select-showtime-language">
                                        {st.language}
                                    </div>
                                )}
                                {st.room && (
                                    <div className="select-showtime-room">
                                        {st.room.name || st.room.roomId}
                                    </div>
                                )}
                            </button>
                        ))
                    ) : (
                        <p className="select-showtime-no-showtime">Không có suất chiếu nào trong ngày này.</p>
                    )}
                </div>
            </div>
        </div>
    );
}