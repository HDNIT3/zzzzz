import { useEffect, useState } from "react";
import { getAllReviewsByPage } from "../services/ReviewService";

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getAllReviewsByPage(page, size);
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [page, size]);

  return { reviews, page, setPage, size, setSize, loading };
}
