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
  deleteWeek as deleteWeekAPI,
} from "../services/ScheduleService";

export function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [createdWeeks, setCreatedWeeks] = useState([]);
  const [userRole, setUserRole] = useState("STAFF");

  // Load user role từ storage
  useEffect(() => {
    try {
      const role = localStorage.getItem("role") || sessionStorage.getItem("role");
      if (role) setUserRole(role);
    } catch (err) {
      console.warn("Unable to load user role:", err);
    }
  }, []);

  // Initialize: load current Monday và danh sách weeks đã tạo
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

  /**
   * Load lịch làm việc của 1 tuần
   */
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
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tạo lịch làm việc mới (MANAGER/ADMIN)
   */
  const createSchedule = useCallback(async (startDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createScheduleAPI(startDate);
      setSchedules(data);
      setCurrentWeekStart(startDate);
      
      // Thêm tuần mới vào danh sách nếu chưa có
      if (!createdWeeks.includes(startDate)) {
        setCreatedWeeks((prev) => [...prev, startDate].sort());
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

  /**
   * Đăng ký ca làm việc (STAFF/MANAGER)
   */
  const registerShift = useCallback(async (shiftId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerShiftAPI(shiftId);
      
      // Reload lịch hiện tại để cập nhật UI
      if (currentWeekStart) {
        await loadSchedule(currentWeekStart);
      }
      
      return result;
    } catch (err) {
      console.error("Error registering shift:", err);
      setError(err.message || "Failed to register for shift");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, loadSchedule]);

  /**
   * Gán nhân viên vào ca (MANAGER/ADMIN)
   */
  const assignShift = useCallback(async (employeeId, shiftId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assignShiftAPI(employeeId, shiftId);
      
      // Reload lịch hiện tại
      if (currentWeekStart) {
        await loadSchedule(currentWeekStart);
      }
      
      return result;
    } catch (err) {
      console.error("Error assigning shift:", err);
      setError(err.message || "Failed to assign employee");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, loadSchedule]);

  /**
   * HỦY ca làm việc đã đăng ký
   */
  const cancelShift = useCallback(async (registrationId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cancelShiftAPI(registrationId);
      
      // Reload lịch hiện tại để cập nhật UI
      if (currentWeekStart) {
        await loadSchedule(currentWeekStart);
      }
      
      return result;
    } catch (err) {
      console.error("Error canceling shift:", err);
      setError(err.message || "Failed to cancel shift");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, loadSchedule]);

  /**
   * Auto-assign nhân viên cho tất cả ca trong tuần (MANAGER/ADMIN)
   */
  const autoAssignShifts = useCallback(async (startDate) => {
    setLoading(true);
    setError(null);
    try {
      const result = await autoAssignShiftsAPI(startDate);
      
      // Reload lịch nếu đang xem tuần đó
      if (startDate === currentWeekStart) {
        await loadSchedule(startDate);
      }
      
      return result;
    } catch (err) {
      console.error("Error auto-assigning shifts:", err);
      setError(err.message || "Failed to auto-assign shifts");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, loadSchedule]);

  /**
   * Xóa toàn bộ lịch của 1 tuần (MANAGER/ADMIN)
   */
  const deleteWeek = useCallback(async (startDate) => {
    setLoading(true);
    setError(null);
    try {
      await deleteWeekAPI(startDate);
      
      // Xóa tuần khỏi danh sách
      setCreatedWeeks((prev) => prev.filter((d) => d !== startDate));
      
      // Clear schedules nếu đang xem tuần đó
      if (currentWeekStart === startDate) {
        setSchedules([]);
      }
      
      return true;
    } catch (err) {
      console.error("Error deleting week:", err);
      setError(err.message || "Failed to delete week");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

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
    deleteWeek,
  };
}