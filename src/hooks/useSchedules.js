import { useState, useEffect, useCallback } from "react";
import {
  getSchedule,
  createSchedule,
  registerShift,
  assignShift,
  cancelShift,
  autoAssignShifts,
  getCurrentMonday,
} from "../services/ScheduleService";

export function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(null);

  // Lấy role từ storage
  const getUserRole = useCallback(() => {
    const role = sessionStorage.getItem("role") ||
      localStorage.getItem("role") ||
      "STAFF";
    
    // Normalize to uppercase for consistent comparison
    return role.toUpperCase();
  }, []);

  // Lấy thứ 2 tuần hiện tại
  const fetchCurrentMonday = useCallback(async () => {
    try {
      const monday = await getCurrentMonday();
      setCurrentWeekStart(monday);
      return monday;
    } catch (err) {
      console.error("Error fetching current Monday:", err);
      // Fallback: tính toán thủ công
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diff);
      const mondayStr = monday.toISOString().split("T")[0];
      setCurrentWeekStart(mondayStr);
      return mondayStr;
    }
  }, []);

  // Tải lịch làm việc
  const loadSchedule = useCallback(async (startDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchedule(startDate);
      // Ensure data is always an array
      setSchedules(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message || "Failed to load schedule");
      setSchedules([]); // Set empty array on error
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo lịch mới
  const handleCreateSchedule = useCallback(async (startDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createSchedule(startDate);
      // Ensure data is always an array
      setSchedules(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message || "Failed to create schedule");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đăng ký ca (STAFF, MANAGER)
  const handleRegisterShift = useCallback(
    async (shiftId) => {
      const role = getUserRole();
      if (role !== "STAFF" && role !== "MANAGER") {
        throw new Error("Only STAFF and MANAGER can register shifts");
      }

      setLoading(true);
      setError(null);
      try {
        const result = await registerShift(shiftId);
        // Reload schedule
        if (currentWeekStart) {
          await loadSchedule(currentWeekStart);
        }
        return result;
      } catch (err) {
        setError(err.message || "Failed to register shift");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getUserRole, currentWeekStart, loadSchedule]
  );

  // Phân công thủ công (MANAGER only)
  const handleAssignShift = useCallback(
    async (employeeId, shiftId) => {
      const role = getUserRole();
      if (role !== "MANAGER") {
        throw new Error("Only MANAGER can assign shifts");
      }

      setLoading(true);
      setError(null);
      try {
        const result = await assignShift(employeeId, shiftId);
        // Reload schedule
        if (currentWeekStart) {
          await loadSchedule(currentWeekStart);
        }
        return result;
      } catch (err) {
        setError(err.message || "Failed to assign shift");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getUserRole, currentWeekStart, loadSchedule]
  );

  // Hủy đăng ký
  const handleCancelShift = useCallback(
    async (registrationId) => {
      setLoading(true);
      setError(null);
      try {
        await cancelShift(registrationId);
        // Reload schedule
        if (currentWeekStart) {
          await loadSchedule(currentWeekStart);
        }
      } catch (err) {
        setError(err.message || "Failed to cancel shift");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentWeekStart, loadSchedule]
  );

  // Tự động phân công (ADMIN, MANAGER)
  const handleAutoAssign = useCallback(
    async (startDate = null) => {
      const role = getUserRole();
      if (role !== "ADMIN" && role !== "MANAGER") {
        throw new Error("Only ADMIN and MANAGER can auto-assign shifts");
      }

      setLoading(true);
      setError(null);
      try {
        const result = await autoAssignShifts(startDate || currentWeekStart);
        // Reload schedule
        if (currentWeekStart) {
          await loadSchedule(currentWeekStart);
        }
        return result;
      } catch (err) {
        setError(err.message || "Failed to auto-assign shifts");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getUserRole, currentWeekStart, loadSchedule]
  );

  // Load lịch tuần hiện tại khi mount
  useEffect(() => {
    fetchCurrentMonday()
      .then((monday) => {
        loadSchedule(monday).catch((err) => {
          console.error("Failed to load initial schedule:", err);
          // Don't throw, just log - component will show empty state
        });
      })
      .catch((err) => {
        console.error("Failed to fetch current Monday:", err);
      });
  }, [fetchCurrentMonday, loadSchedule]);

  return {
    schedules,
    loading,
    error,
    currentWeekStart,
    userRole: getUserRole(),
    loadSchedule,
    createSchedule: handleCreateSchedule,
    registerShift: handleRegisterShift,
    assignShift: handleAssignShift,
    cancelShift: handleCancelShift,
    autoAssignShifts: handleAutoAssign,
    fetchCurrentMonday,
  };
}