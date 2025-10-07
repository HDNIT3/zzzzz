import api from "./api";

export async function getAllReviewsByPage(page = 1, size = 10, movieId, customerId, from, to) {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("size", size);

  if (movieId) params.append("movieId", movieId);
  if (customerId) params.append("customerId", customerId);
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const res = await api.get(`/api/reviews?${params.toString()}`);
  console.log(res.data);
  return res.data;
}