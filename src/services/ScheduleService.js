import api from "./api";

export async function getSchedule(startDate) {
  try {
    const response = await api.get("/api/shifts/schedule/week", {
      params: { startDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    throw error.response?.data || error;
  }
}


export async function createSchedule(startDate) {
  try {
    const response = await api.post("/api/shifts/schedule", null, {
      params: { startDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating schedule:", error);
    throw error.response?.data || error;
  }
}

export async function registerShift(shiftId) {
  try {
    const response = await api.post("/api/shifts/register", {
      shiftId,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering shift:", error);
    throw error.response?.data || error;
  }
}

export async function assignShift(employeeId, shiftId) {
  try {
    const response = await api.post("/api/shifts/assign", {
      employeeId,
      shiftId,
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning shift:", error);
    throw error.response?.data || error;
  }
}

export async function cancelShift(registrationId) {
  try {
    const response = await api.delete(
      `/api/shifts/registration/${registrationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling shift:", error);
    throw error.response?.data || error;
  }
}

export async function autoAssignShifts(startDate = null) {
  try {
    const params = startDate ? { startDate } : {};
    const response = await api.post("/api/shifts/auto-assign", null, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error auto-assigning shifts:", error);
    throw error.response?.data || error;
  }
}

export async function getCurrentMonday() {
  try {
    const response = await api.get("/api/shifts/current-monday");
    return response.data.currentMonday;
  } catch (error) {
    console.error("Error getting current Monday:", error);
    throw error.response?.data || error;
  }
}