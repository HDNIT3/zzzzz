import { useState, useEffect, useCallback, useMemo } from "react";
import { useMovies } from "../../hooks/useMovies";
import { ShowtimeManagement } from "../../components/modals/operation/ShowtimeManagement";
import "../../styles/operation.css";

const AGE_RATINGS = ["P", "K", "T13", "T16", "T18", "C"];
const GENRES = [
  "ACTION", "ADVENTURE", "ANIMATION", "COMEDY", "CRIME",
  "DRAMA", "FANTASY", "HORROR", "MUSICAL", "ROMANCE",
  "SCI_FI", "THRILLER", "WAR", "WESTERN"
];

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export function Operation() {
  const {
    movies,
    loading,
    error,
    fetchAllMovies,
    createMovie,
    updateMovie,
    deleteMovie,
  } = useMovies();

  const [activeTab, setActiveTab] = useState("movies"); // "movies" or "showtimes"
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    ageRating: "P",
    releaseDate: "",
    rating: "",
    genres: [],
    cast: [],
  });
  const [castInput, setCastInput] = useState("");

  useEffect(() => {
    fetchAllMovies();
  }, []);

  const handleCreate = useCallback(() => {
    setModalMode("create");
    setSelectedMovie(null);
    resetForm();
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((movie) => {
    setModalMode("edit");
    setSelectedMovie(movie);
    setFormData({
      title: movie.title || "",
      description: movie.description || "",
      duration: movie.duration || "",
      ageRating: movie.ageRating || "P",
      releaseDate: movie.releaseDate || "",
      rating: movie.rating || "",
      genres: movie.genres || [],
      cast: movie.cast || [],
    });
    setPosterPreview(movie.posterUrl);
    setFileSize(0);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (movieId, title) => {
    if (window.confirm(`Bạn có chắc muốn xóa phim "${title}"?`)) {
      try {
        await deleteMovie(movieId);
        alert("Xóa phim thành công!");
      } catch (err) {
        alert("Lỗi khi xóa phim: " + err.message);
      }
    }
  }, [deleteMovie]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: "",
      ageRating: "P",
      releaseDate: "",
      rating: "",
      genres: [],
      cast: [],
    });
    setPosterFile(null);
    setPosterPreview(null);
    setFileSize(0);
    setCastInput("");
  };

  const handlePosterChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 6 * 1024 * 1024;
    
    if (file.size > maxSize) {
      alert(`File quá lớn! Kích thước tối đa: 6MB\nKích thước file của bạn: ${formatFileSize(file.size)}`);
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file JPG, PNG, GIF!');
      e.target.value = '';
      return;
    }

    setPosterFile(file);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPosterPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenreToggle = useCallback((genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  }, []);

  const handleAddCast = useCallback(() => {
    if (castInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()],
      }));
      setCastInput("");
    }
  }, [castInput]);

  const handleRemoveCast = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên phim!");
      return;
    }

    if (modalMode === "create" && !posterFile) {
      alert("Vui lòng chọn poster cho phim!");
      return;
    }

    if (formData.genres.length === 0) {
      alert("Vui lòng chọn ít nhất 1 thể loại!");
      return;
    }

    try {
      const movieData = {
        title: formData.title,
        description: formData.description,
        duration: parseInt(formData.duration) || 0,
        ageRating: formData.ageRating,
        releaseDate: formData.releaseDate,
        rating: parseFloat(formData.rating) || 0,
        genres: formData.genres,
        cast: formData.cast,
      };

      if (modalMode === "create") {
        await createMovie(movieData, posterFile);
        alert("Tạo phim thành công!");
      } else {
        await updateMovie(selectedMovie.movieId, movieData, posterFile);
        alert("Cập nhật phim thành công!");
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const movieRows = useMemo(() => {
    return movies.map((movie) => (
      <tr key={movie.movieId}>
        <td>
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="operation-poster-thumbnail"
            loading="lazy"
          />
        </td>
        <td className="operation-title-cell">{movie.title}</td>
        <td>{movie.duration} phút</td>
        <td>
          <span className="operation-rating-badge">{movie.rating}/10</span>
        </td>
        <td>
          <div className="operation-genres-cell">
            {movie.genres?.slice(0, 2).join(", ")}
            {movie.genres?.length > 2 && "..."}
          </div>
        </td>
        <td>{movie.releaseDate}</td>
        <td>
          <div className="operation-action-buttons">
            <button
              className="operation-btn-edit"
              onClick={() => handleEdit(movie)}
            >
              Sửa
            </button>
            <button
              className="operation-btn-delete"
              onClick={() => handleDelete(movie.movieId, movie.title)}
            >
              Xóa
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [movies, handleEdit, handleDelete]);

  return (
    <div className="operation-container">
      {/* Tab Navigation */}
      <div className="operation-tabs">
        <button
          className={`operation-tab ${activeTab === "movies" ? "active" : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          🎬 Quản Lý Phim
        </button>
        <button
          className={`operation-tab ${activeTab === "showtimes" ? "active" : ""}`}
          onClick={() => setActiveTab("showtimes")}
        >
          🎫 Quản Lý Suất Chiếu
        </button>
      </div>

      {/* Movies Management */}
      {activeTab === "movies" && (
        <>
          <div className="operation-header">
            <h1 className="operation-title">Quản Lý Phim</h1>
            <button className="operation-btn-create" onClick={handleCreate}>
              + Thêm Phim Mới
            </button>
          </div>

          {error && <div className="operation-error-message">{error}</div>}

          {loading ? (
            <div className="operation-loading">Đang tải...</div>
          ) : (
            <div className="operation-table-container">
              <table className="operation-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Tên Phim</th>
                    <th>Thời Lượng</th>
                    <th>Đánh Giá</th>
                    <th>Thể Loại</th>
                    <th>Ngày Phát Hành</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>{movieRows}</tbody>
              </table>
            </div>
          )}

          {/* Movie Modal */}
          {showModal && (
            <div className="operation-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="operation-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="operation-modal-header">
                  <h2 className="operation-modal-title">
                    {modalMode === "create" ? "Thêm Phim Mới" : "Chỉnh Sửa Phim"}
                  </h2>
                  <button
                    className="operation-btn-close"
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="operation-modal-form">
                  <div className="operation-form-row">
                    <div className="operation-form-group operation-poster-upload">
                      <label>Poster * (Tối đa 6MB)</label>
                      <div className="operation-poster-preview-container">
                        {posterPreview ? (
                          <img
                            src={posterPreview}
                            alt="Preview"
                            className="operation-poster-preview"
                          />
                        ) : (
                          <div className="operation-poster-placeholder">Chưa có ảnh</div>
                        )}
                      </div>
                      {fileSize > 0 && (
                        <div className="operation-file-info">
                          📁 {formatFileSize(fileSize)}
                          {fileSize > 6 * 1024 * 1024 && (
                            <span className="operation-file-warning"> ⚠️ Gần đạt giới hạn</span>
                          )}
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handlePosterChange}
                        className="operation-file-input"
                      />
                    </div>

                    <div className="operation-form-group-flex">
                      <div className="operation-form-group">
                        <label>Tên Phim *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Nhập tên phim"
                          required
                        />
                      </div>

                      <div className="operation-form-group">
                        <label>Mô Tả</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Nhập mô tả phim"
                          rows="4"
                        />
                      </div>

                      <div className="operation-form-row-inline">
                        <div className="operation-form-group">
                          <label>Thời Lượng (phút)</label>
                          <input
                            type="number"
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({ ...formData, duration: e.target.value })
                            }
                            placeholder="120"
                            min="1"
                          />
                        </div>

                        <div className="operation-form-group">
                          <label>Phân Loại</label>
                          <select
                            value={formData.ageRating}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ageRating: e.target.value,
                              })
                            }
                          >
                            {AGE_RATINGS.map((rating) => (
                              <option key={rating} value={rating}>
                                {rating}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="operation-form-group">
                          <label>Ngày Phát Hành</label>
                          <input
                            type="date"
                            value={formData.releaseDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                releaseDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="operation-form-group">
                    <label>Thể Loại * (Chọn ít nhất 1)</label>
                    <div className="operation-genres-grid">
                      {GENRES.map((genre) => (
                        <label key={genre} className="operation-genre-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.genres.includes(genre)}
                            onChange={() => handleGenreToggle(genre)}
                          />
                          <span>{genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="operation-form-group">
                    <label>Diễn Viên</label>
                    <div className="operation-cast-input-container">
                      <input
                        type="text"
                        value={castInput}
                        onChange={(e) => setCastInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCast())}
                        placeholder="Nhập tên diễn viên và Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddCast}
                        className="operation-btn-add-cast"
                      >
                        Thêm
                      </button>
                    </div>
                    <div className="operation-cast-list">
                      {formData.cast.map((actor, index) => (
                        <div key={index} className="operation-cast-item">
                          <span>{actor}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCast(index)}
                            className="operation-btn-remove-cast"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="operation-modal-footer">
                    <button
                      type="button"
                      className="operation-btn-cancel"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="operation-btn-submit">
                      {modalMode === "create" ? "Tạo Phim" : "Cập Nhật"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Showtimes Management */}
      {activeTab === "showtimes" && <ShowtimeManagement movies={movies} />}
    </div>
  );
}