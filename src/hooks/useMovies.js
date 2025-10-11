import { useEffect, useState } from "react";
import {
  getAllMovies,
  getHotMovies,
  getUpcomingMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../services/MovieService";

export function useMovies(token) {
  const [movies, setMovies] = useState([]);
  const [hotMovies, setHotMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllMovies = async () => {
    try {
      setLoading(true);
      const data = await getAllMovies();
      setMovies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotMovies = async () => {
    try {
      setLoading(true);
      const data = await getHotMovies();
      setHotMovies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingMovies = async () => {
    try {
      setLoading(true);
      const data = await getUpcomingMovies();
      setUpcomingMovies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotMovies();
    fetchUpcomingMovies();
  }, []);

  return {
    movies,
    hotMovies,
    upcomingMovies,
    loading,
    error,
    fetchAllMovies,
    fetchHotMovies,
    fetchUpcomingMovies,
    createMovie,
    updateMovie,
    deleteMovie,
  };
}
