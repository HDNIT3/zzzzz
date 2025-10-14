import { useState, useEffect, useCallback } from "react";
import {
  getSchedule,
  createSchedule as createScheduleAPI,
  registerShift as registerShiftAPI,
  assignShift as assignShiftAPI,
  cancelShift as cancelShiftAPI,
  autoAssignShifts as autoAssignShiftsAPI,
  getCurrentMonday,
  getCreatedWeeks,
} from "../services/ScheduleService";
export function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [createdWeeks, setCreatedWeeks] = useState([]);
  const [userRole, setUserRole] = useState("STAFF"); // mặc định là STAFF

  // --- Fetch role (giả định role được lưu trong localStorage hoặc API)
  useEffect(() => {
    try {
      const role = localStorage.getItem("role") || sessionStorage.getItem("role");
      if (role) setUserRole(role);
    } catch (err) {
      console.warn("Unable to load user role:", err);
    }
  }, []);

  // --- Load current Monday & created weeks khi mở trang
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const [monday, weeks] = await Promise.all([
          getCurrentMonday(),
          getCreatedWeeks(),
        ]);
        setCurrentWeekStart(monday);
        setCreatedWeeks(weeks);
      } catch (err) {
        console.error("Failed to initialize schedule data:", err);
        setError(err.message || "Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // --- Load schedule theo ngày bắt đầu (Monday)
  const loadSchedule = useCallback(async (startDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchedule(startDate);
      setSchedules(data);
      setCurrentWeekStart(startDate);
    } catch (err) {
      console.error("Error loading schedule:", err);
      setError(err.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Tạo schedule mới
  const createSchedule = useCallback(async (startDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createScheduleAPI(startDate);
      setSchedules(data);
      if (!createdWeeks.includes(startDate)) {
        setCreatedWeeks((prev) => [...prev, startDate]);
      }
      return data;
    } catch (err) {
      console.error("Error creating schedule:", err);
      setError(err.message || "Failed to create schedule");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createdWeeks]);

  // --- Đăng ký ca làm việc
  const registerShift = useCallback(async (shiftId) => {
    setLoading(true);
    try {
      const result = await registerShiftAPI(shiftId);
      // Reload lại schedule sau khi đăng ký
      if (currentWeekStart) await loadSchedule(currentWeekStart);
      return result;
    } catch (err) {
      console.error("Error registering shift:", err);
      setError(err.message || "Failed to register for shift");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, loadSchedule]);

  // --- Gán nhân viên vào ca
  const assignShift = useCallback(async (employeeId, shiftId) => {
    setLoading(true);
    try {
      const result = await assignShiftAPI(employeeId, shiftId);
      if (currentWeekStart) await loadSchedule(currentWeekStart);
      return result;
    } catch (err) {
      console.error("Error assigning shift:", err);
      setError(err.message || "Failed to assign employee");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, loadSchedule]);

  // --- Hủy đăng ký ca
  const cancelShift = useCallback(async (registrationId) => {
    setLoading(true);
    try {
      const result = await cancelShiftAPI(registrationId);
      if (currentWeekStart) await loadSchedule(currentWeekStart);
      return result;
    } catch (err) {
      console.error("Error canceling shift:", err);
      setError(err.message || "Failed to cancel shift");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, loadSchedule]);

  // --- Tự động gán ca
  const autoAssignShifts = useCallback(async (startDate) => {
    setLoading(true);
    try {
      const result = await autoAssignShiftsAPI(startDate);
      if (startDate === currentWeekStart) await loadSchedule(startDate);
      return result;
    } catch (err) {
      console.error("Error auto-assigning shifts:", err);
      setError(err.message || "Failed to auto-assign shifts");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, loadSchedule]);

  return {
    schedules,
    loading,
    error,
    currentWeekStart,
    createdWeeks,
    userRole,
    loadSchedule,
    createSchedule,
    registerShift,
    assignShift,
    cancelShift,
    autoAssignShifts,
  };
}
