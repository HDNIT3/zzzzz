import { useEffect, useState } from "react";
import {
  getAllMovies,
  getHotMovies,
  getUpcomingMovies,
  createMovie as createMovieAPI,
  updateMovie as updateMovieAPI,
  deleteMovie as deleteMovieAPI,
} from "../services/MovieService";

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [hotMovies, setHotMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllMovies = async () => {
    try {
      setLoading(true);
      const data = await getAllMovies();
      
      setMovies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setMovies([]); 
      console.error("Error fetching all movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotMovies = async () => {
    try {
      setLoading(true);
      const data = await getHotMovies();
      // Đảm bảo luôn trả về mảng
      setHotMovies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setHotMovies([]); // Set empty array on error
      console.error("Error fetching hot movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingMovies = async () => {
    try {
      setLoading(true);
      const data = await getUpcomingMovies();
      // Đảm bảo luôn trả về mảng
      setUpcomingMovies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setUpcomingMovies([]); // Set empty array on error
      console.error("Error fetching upcoming movies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create movie với poster upload
  const createMovie = async (movieData, posterFile) => {
    try {
      setLoading(true);
      const newMovie = await createMovieAPI(movieData, posterFile);
      
      // Refresh danh sách movies
      await fetchAllMovies();
      
      setError(null);
      return newMovie;
    } catch (err) {
      setError(err.message);
      console.error("Error creating movie:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update movie với optional poster
  const updateMovie = async (movieId, movieData = null, posterFile = null) => {
    try {
      setLoading(true);
      const updatedMovie = await updateMovieAPI(movieId, movieData, posterFile);
      
      // Refresh danh sách movies
      await fetchAllMovies();
      
      setError(null);
      return updatedMovie;
    } catch (err) {
      setError(err.message);
      console.error("Error updating movie:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete movie
  const deleteMovie = async (movieId) => {
    try {
      setLoading(true);
      await deleteMovieAPI(movieId);
      
      // Refresh danh sách movies
      await fetchAllMovies();
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error deleting movie:", err);
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