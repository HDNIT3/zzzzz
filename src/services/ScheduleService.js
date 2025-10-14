import api from "./api";

// Get current Monday
export const getCurrentMonday = async () => {
  const res = await api.get("/api/shifts/current-monday");
  return res.data.currentMonday; // Lưu ý backend trả về object { currentMonday, hint }
};

// Get all created weeks
export const getCreatedWeeks = async () => {
  const res = await api.get("/api/shifts/created-weeks");
  return res.data;
};

// Get schedule for a specific week
export const getSchedule = async (startDate) => {
  const res = await api.get("/api/shifts/schedule/week", {
    params: { startDate },
  });
  return res.data;
};

// Create new weekly schedule
export const createSchedule = async (startDate) => {
  const res = await api.post("/api/shifts/schedule", null, {
    params: { startDate },
  });
  return res.data;
};

// Register for a shift (STAFF, MANAGER)
export const registerShift = async (shiftId) => {
  const res = await api.post("/api/shifts/register", { shiftId });
  return res.data;
};
// Assign employee to shift (MANAGER)
export const assignShift = async (employeeId, shiftId) => {
  const res = await api.post("/api/shifts/assign", {
    employeeId,
    shiftId,
  });
  return res.data;
};
// Cancel shift registration
export const cancelShift = async (registrationId) => {
  const res = await api.delete(`/api/shifts/cancel/${registrationId}`);
  return res.data;
};

// Auto assign shifts for a week (ADMIN, MANAGER)
export const autoAssignShifts = async (startDate) => {
  const res = await api.post("/api/shifts/auto-assign", null, {
    params: { startDate },
  });
  return res.data;
};

// Get employee shift count for a specific week
export const getEmployeeShiftCount = async (startDate) => {
  const res = await api.get("/api/schedule/employee-shift-counts", {
    params: { startDate },
  });
  return res.data;
};