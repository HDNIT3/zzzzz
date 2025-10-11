import { useEffect, useState } from 'react'
import {
  getShowtimesForNext7Days,
  getShowtimesByDate
} from '../services/ShowtimeService'
import { getMovieById } from '../services/MovieService'

export function useShowtimes (movieId) {
  const [movie, setMovie] = useState({})
  const [showtimes, setShowtimes] = useState([])
  const [filteredShowtimes, setFilteredShowtimes] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emptyMessage, setEmptyMessage] = useState('')

  const formatDate = date => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    if (!movieId) {
      setMovie({})
      setShowtimes([])
      setFilteredShowtimes([])
      setEmptyMessage('No movie selected.')
      return
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [movieData, showtimeData] = await Promise.all([
          getMovieById(movieId).catch(() => ({})),
          getShowtimesForNext7Days(movieId).catch(() => [])
        ])

        setMovie(movieData || {})
        const validShowtimes = Array.isArray(showtimeData) ? showtimeData : []
        setShowtimes(validShowtimes)

        if (validShowtimes.length > 0) {
          const todayStr = formatDate(new Date())
          setSelectedDate(todayStr)

          const filtered = validShowtimes.filter(
            st => formatDate(st.startTime) === todayStr
          )

          setFilteredShowtimes(filtered)
          setEmptyMessage('')
        } else {
          setFilteredShowtimes([])
          setEmptyMessage('No showtimes available for the next 7 days.')
        }
      } catch (err) {
        console.error('Error fetching showtimes:', err)
        setMovie({})
        setShowtimes([])
        setFilteredShowtimes([])
        setError('Failed to load showtimes. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [movieId])

  const handleDateSelect = date => {
    const dateStr = formatDate(date)
    setSelectedDate(dateStr)

    const filtered = showtimes.filter(
      st => formatDate(st.startTime) === dateStr
    )

    if (filtered.length > 0) {
      setFilteredShowtimes(filtered)
      setEmptyMessage('')
    } else {
      setFilteredShowtimes([])
      setEmptyMessage('No showtimes available for this date.')
    }
  }

  return {
    movie,
    filteredShowtimes,
    selectedDate,
    loading,
    error,
    emptyMessage,
    handleDateSelect,
    formatDate
  }
}
