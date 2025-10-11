import api from "./api";

export async function getAllReviewsByPage(page = 1, size = 10, movieTitle, from, to) {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("size", size);

  if (movieTitle) params.append("movieTitle", movieTitle);
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const res = await api.get(`/api/reviews?${params.toString()}`);
  return res.data;
}

export async function createReview(reviewData) {
  try {
    const res = await api.post("/api/reviews", reviewData);
    return res.data;
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

export async function getReviewById(reviewId) {
  try {
    const res = await api.get(`/api/reviews/${reviewId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

export async function updateReview(reviewId, reviewData) {
  try {
    const res = await api.put(`/api/reviews/${reviewId}`, reviewData);
    return res.data;
  } catch (error) {
    console.error('Error updating review:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

export async function deleteReview(reviewId) {
  try {
    const res = await api.delete(`/api/reviews/${reviewId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}