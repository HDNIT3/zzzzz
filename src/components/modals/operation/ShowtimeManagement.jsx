import { useState, useCallback, useEffect } from "react";
import { useShowtimes } from "../../../hooks/useShowtimes";
import "../../../styles/showtime.css";

export function ShowtimeManagement({ movies }) {
  const [selectedMovieId, setSelectedMovieId] = useState("");
  
  const {
    showtimes,
    rooms,
    loading,
    error,
    fetchShowtimes,
    createShowtime,
    updateShowtime,
    deleteShowtime,
  } = useShowtimes(selectedMovieId);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [formData, setFormData] = useState({
    movieId: "",
    roomId: "",
    startTime: "",
    language: "Vietsub",
  });

  // Update formData when selectedMovieId changes
  useEffect(() => {
    if (selectedMovieId && !showModal) {
      setFormData(prev => ({ ...prev, movieId: selectedMovieId }));
    }
  }, [selectedMovieId, showModal]);

  const handleMovieSelect = (movieId) => {
    setSelectedMovieId(movieId);
  };

  const handleCreate = useCallback(() => {
    setModalMode("create");
    setSelectedShowtime(null);
    setFormData({
      movieId: selectedMovieId || "",
      roomId: "",
      startTime: "",
      language: "Vietsub",
    });
    setShowModal(true);
  }, [selectedMovieId]);

  const handleEdit = useCallback((showtime) => {
    setModalMode("edit");
    setSelectedShowtime(showtime);
    
    const formattedTime = showtime.startTime 
      ? new Date(showtime.startTime).toISOString().slice(0, 16)
      : "";

    setFormData({
      movieId: showtime.movie?.movieId || "",
      roomId: showtime.room?.roomId || "",
      startTime: formattedTime,
      language: showtime.language || "Vietsub",
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    async (showtimeId) => {
      if (window.confirm("Bạn có chắc muốn xóa suất chiếu này?")) {
        try {
          await deleteShowtime(showtimeId, selectedMovieId);
          alert("Xóa suất chiếu thành công!");
        } catch (err) {
          alert("Lỗi: " + err.message);
        }
      }
    },
    [deleteShowtime, selectedMovieId]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.movieId) {
      alert("Vui lòng chọn phim!");
      return;
    }

    if (!formData.roomId) {
      alert("Vui lòng chọn phòng!");
      return;
    }

    if (!formData.startTime) {
      alert("Vui lòng chọn thời gian bắt đầu!");
      return;
    }

    try {
      const isoTime = formData.startTime.length === 16 
        ? formData.startTime + ":00" 
        : formData.startTime;

      const showtimeData = {
        movieId: formData.movieId,
        roomId: formData.roomId,
        startTime: isoTime,
        language: formData.language,
      };

      if (modalMode === "create") {
        await createShowtime(showtimeData);
        alert("Tạo suất chiếu thành công!");
      } else {
        await updateShowtime(selectedShowtime.showtimeId, showtimeData, selectedMovieId);
        alert("Cập nhật suất chiếu thành công!");
      }

      setShowModal(false);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="showtime-container">
      <div className="showtime-header">
        <h1 className="showtime-title">Quản Lý Suất Chiếu</h1>
        <div className="showtime-controls">
          <select
            className="showtime-movie-select"
            value={selectedMovieId}
            onChange={(e) => handleMovieSelect(e.target.value)}
          >
            <option value="">-- Tất Cả Phim (14 ngày tới) --</option>
            {movies.map((movie) => (
              <option key={movie.movieId} value={movie.movieId}>
                {movie.title}
              </option>
            ))}
          </select>
          <button
            className="showtime-btn-create"
            onClick={handleCreate}
          >
            + Thêm Suất Chiếu
          </button>
        </div>
      </div>

      {error && <div className="showtime-error-message">{error}</div>}

      {loading ? (
        <div className="showtime-loading">Đang tải...</div>
      ) : showtimes.length === 0 ? (
        <div className="showtime-empty-state">
          {selectedMovieId 
            ? "Chưa có suất chiếu nào cho phim này" 
            : "Chưa có suất chiếu nào trong 14 ngày tới"}
        </div>
      ) : (
        <div className="showtime-table-container">
          <table className="showtime-table">
            <thead>
              <tr>
                <th>Phim</th>
                <th>Phòng</th>
                <th>Thời Gian Bắt Đầu</th>
                <th>Thời Gian Kết Thúc</th>
                <th>Ngôn Ngữ</th>
                <th>Sức Chứa</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((showtime) => (
                <tr key={showtime.showtimeId}>
                  <td className="showtime-movie-cell">
                    <div className="showtime-movie-info">
                      <strong>{showtime.movie?.title || "N/A"}</strong>
                      <small>{showtime.movie?.duration || 0} phút</small>
                    </div>
                  </td>
                  <td className="showtime-room-cell">
                    {showtime.room?.name || "N/A"}
                  </td>
                  <td>{formatDateTime(showtime.startTime)}</td>
                  <td>{formatDateTime(showtime.endTime)}</td>
                  <td>
                    <span className="showtime-language-badge">
                      {showtime.language}
                    </span>
                  </td>
                  <td>{showtime.room?.capacity || 0} ghế</td>
                  <td>
                    <div className="showtime-action-buttons">
                      <button
                        className="showtime-btn-edit"
                        onClick={() => handleEdit(showtime)}
                      >
                        Sửa
                      </button>
                      <button
                        className="showtime-btn-delete"
                        onClick={() => handleDelete(showtime.showtimeId)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="showtime-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="showtime-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="showtime-modal-header">
              <h2 className="showtime-modal-title">
                {modalMode === "create"
                  ? "Thêm Suất Chiếu Mới"
                  : "Chỉnh Sửa Suất Chiếu"}
              </h2>
              <button
                className="showtime-btn-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="showtime-modal-form">
              <div className="showtime-form-group">
                <label>Phim *</label>
                <select
                  value={formData.movieId}
                  onChange={(e) =>
                    setFormData({ ...formData, movieId: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn Phim --</option>
                  {movies.map((movie) => (
                    <option key={movie.movieId} value={movie.movieId}>
                      {movie.title} ({movie.duration} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div className="showtime-form-group">
                <label>Phòng Chiếu *</label>
                <select
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomId: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn Phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.roomId} value={room.roomId}>
                      {room.name} (Sức chứa: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="showtime-form-group">
                <label>Thời Gian Bắt Đầu *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
                <small className="showtime-hint">
                  Thời gian kết thúc sẽ được tính tự động dựa trên thời lượng phim
                </small>
              </div>

              <div className="showtime-form-group">
                <label>Ngôn Ngữ *</label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  required
                >
                  <option value="Vietsub">VI</option>
                  <option value="Vietsub">EN</option>
                </select>
              </div>

              <div className="showtime-modal-footer">
                <button
                  type="button"
                  className="showtime-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="showtime-btn-submit">
                  {modalMode === "create" ? "Tạo Suất Chiếu" : "Cập Nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}