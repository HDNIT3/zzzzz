import { useEffect, useState } from "react";
import {
  getAllMoviesRequest,
  getHotMoviesRequest,
  getUpcomingMoviesRequest,
  createMovieRequest,
  updateMovieRequest,
  deleteMovieRequest,
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
      const data = await getAllMoviesRequest();
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
      const data = await getHotMoviesRequest();
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
      const data = await getUpcomingMoviesRequest();
      setUpcomingMovies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMovie = async (movieData) => {
    try {
      setLoading(true);
      const created = await createMovieRequest(movieData, token);
      setMovies((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMovie = async (id, movieData) => {
    try {
      setLoading(true);
      const updated = await updateMovieRequest(id, movieData, token);
      setMovies((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (id) => {
    try {
      setLoading(true);
      await deleteMovieRequest(id, token);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
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
