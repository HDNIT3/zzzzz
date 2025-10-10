import { useState } from "react";
import { Star, Filter, Calendar, User, Film, X } from "lucide-react";
import { useReviews } from "../hooks/useReview";
import "../styles/user-reviews.css";

export default function UserReviews() {
  const { reviews, page, setPage, size, setSize, loading } = useReviews();
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    movieId: "",
    customerId: "",
    from: "",
    to: ""
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      movieId: "",
      customerId: "",
      from: "",
      to: ""
    });
    setPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="user-reviews-stars-container">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "user-reviews-star-filled" : "user-reviews-star-empty"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="user-reviews user-reviews-page">
      <div className="user-reviews-container">
        {/* Header */}
        <div className="user-reviews-header">
          <div className="user-reviews-header-content">
            <h1 className="user-reviews-page-title">User Reviews</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="user-reviews-btn-filter"
            >
              <Filter size={20} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="user-reviews-filters-panel">
              <div className="user-reviews-filters-grid">
                <div className="user-reviews-filter-item">
                  <label className="user-reviews-filter-label">
                    <Film size={16} className="user-reviews-label-icon" />
                    Movie ID
                  </label>
                  <input
                    type="text"
                    value={filters.movieId}
                    onChange={(e) => handleFilterChange('movieId', e.target.value)}
                    placeholder="Enter movie ID"
                    className="user-reviews-filter-input"
                  />
                </div>

                <div className="user-reviews-filter-item">
                  <label className="user-reviews-filter-label">
                    <User size={16} className="user-reviews-label-icon" />
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={filters.customerId}
                    onChange={(e) => handleFilterChange('customerId', e.target.value)}
                    placeholder="Enter customer ID"
                    className="user-reviews-filter-input"
                  />
                </div>

                <div className="user-reviews-filter-item">
                  <label className="user-reviews-filter-label">
                    <Calendar size={16} className="user-reviews-label-icon" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => handleFilterChange('from', e.target.value)}
                    className="user-reviews-filter-input"
                  />
                </div>

                <div className="user-reviews-filter-item">
                  <label className="user-reviews-filter-label">
                    <Calendar size={16} className="user-reviews-label-icon" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => handleFilterChange('to', e.target.value)}
                    className="user-reviews-filter-input"
                  />
                </div>
              </div>

              <div className="user-reviews-filter-actions">
                <button onClick={applyFilters} className="user-reviews-btn-apply">
                  Apply Filters
                </button>
                <button onClick={clearFilters} className="user-reviews-btn-clear">
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="user-reviews-loading-container">
            <div className="user-reviews-spinner"></div>
            <p className="user-reviews-loading-text">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="user-reviews-empty-container">
            <p className="user-reviews-empty-text">No reviews found</p>
          </div>
        ) : (
          <div className="user-reviews-list">
            {reviews.map((review) => (
              <div key={review.reviewId} className="user-reviews-card">
                <div className="user-reviews-card-header">
                  <div className="user-reviews-card-info">
                    <div className="user-reviews-user-rating">
                      <h3 className="user-reviews-user-name">{review.cusName}</h3>
                      {renderStars(review.rating)}
                    </div>
                    <p className="user-reviews-movie-info">
                      Review for: <span className="user-reviews-movie-title">{review.movieTitle}</span>
                    </p>
                  </div>
                  <span className="user-reviews-date">{formatDate(review.createdAt)}</span>
                </div>
                
                <p className="user-reviews-content">{review.content}</p>
                
                <div className="user-reviews-meta">
                  <span>Review ID: {review.reviewId}</span>
                  <span>Customer ID: {review.customerId}</span>
                  <span>Movie ID: {review.movieId}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && reviews.length > 0 && (
          <div className="user-reviews-pagination-container">
            <div className="user-reviews-pagination-content">
              <div className="user-reviews-page-size-selector">
                <label className="user-reviews-page-size-label">Items per page:</label>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="user-reviews-page-size-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="user-reviews-pagination-controls">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="user-reviews-btn-pagination"
                >
                  Previous
                </button>
                <span className="user-reviews-page-number">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  className="user-reviews-btn-pagination"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}