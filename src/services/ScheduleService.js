import api from "./api";

/**
 * Lấy thứ 2 của tuần hiện tại
 */
export const getCurrentMonday = async () => {
  const res = await api.get("/api/shifts/current-monday");
  return res.data.currentMonday; 
};

/**
 * Lấy danh sách các tuần đã tạo
 */
export const getCreatedWeeks = async () => {
  const res = await api.get("/api/shifts/created-weeks");
  return res.data;
};

/**
 * Lấy lịch làm việc của 1 tuần (theo ngày thứ 2)
 */
export const getSchedule = async (startDate) => {
  const res = await api.get("/api/shifts/schedule/week", {
    params: { startDate },
  });
  return res.data;
};

/**
 * Tạo lịch làm việc cho 1 tuần (MANAGER/ADMIN only)
 */
export const createSchedule = async (startDate) => {
  const res = await api.post("/api/shifts/schedule", null, {
    params: { startDate },
  });
  return res.data;
};

/**
 * Xóa toàn bộ lịch của 1 tuần (MANAGER/ADMIN only)
 */
export const deleteWeek = async (startDate) => {
  if (!startDate) throw new Error("startDate is required");
  const res = await api.delete("/api/shifts/schedule", {
    params: { startDate },
  });
  return res.data;
};

/**
 * Đăng ký ca làm việc (STAFF/MANAGER tự đăng ký)
 */
export const registerShift = async (shiftId) => {
  const res = await api.post("/api/shifts/register", { shiftId });
  return res.data;
};

/**
 * Gán nhân viên vào ca (MANAGER/ADMIN only)
 */
export const assignShift = async (employeeId, shiftId) => {
  const res = await api.post("/api/shifts/assign", {
    employeeId,
    shiftId,
  });
  return res.data;
};

/**
 * HỦY ca làm việc đã đăng ký
 * @param {number} registrationId - ID của bản đăng ký cần hủy
 */
export const cancelShift = async (registrationId) => {
  if (!registrationId) throw new Error("registrationId is required");
  const res = await api.delete(`/api/shifts/cancel/${registrationId}`);
  return res.data;
};

/**
 * Tự động gán nhân viên cho tất cả ca trong tuần (MANAGER/ADMIN only)
 */
export const autoAssignShifts = async (startDate) => {
  const res = await api.post("/api/shifts/auto-assign", null, {
    params: { startDate },
  });
  return res.data;
};

/**
 * Lấy số lượng ca của từng nhân viên trong tuần
 */
export const getEmployeeShiftCount = async (startDate) => {
  const res = await api.get("/api/schedule/employee-shift-counts", {
    params: { startDate },
  });
  return res.data;
};

/**
 * Lấy danh sách ca đã đăng ký của user hiện tại (cho timeline)
 */
export const getMyRegisteredShifts = async () => {
  const res = await api.get("/api/shifts/registered");
  return res.data;
};