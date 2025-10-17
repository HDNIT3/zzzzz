import React, { useState } from "react";
import { useSchedules } from "../hooks/useSchedules";
import { AssignStaff } from "../components/modals/operation/AssignStaff";
import { ScheduleSidebar } from "../components/modals/operation/ScheduleSidebar";
import "../styles/schedule.css";
import {
  Calendar,
  Trash2,
  Bot,
  AlertTriangle,
  X,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  UserPlus,
} from "lucide-react";

function InlineToast({ toast, onClose }) {
  if (!toast) return null;
  const palette = {
    warning: { bg: "rgba(255,193,7,0.12)", bd: "#FFC107", fg: "#B28704", Icon: AlertTriangle },
  };
  const c = palette[toast.type] || palette.warning;
  const Icon = c.Icon;
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.bd}`,
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        maxWidth: 420,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: "22px" }}>
        <Icon size={18} />
      </span>
      <div style={{ fontSize: 14, lineHeight: "20px" }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>Notification</div>
        <div>{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          marginLeft: 8,
          background: "transparent",
          border: 0,
          color: c.fg,
          fontSize: 18,
          lineHeight: "18px",
          cursor: "pointer",
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmText = "Confirm", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="shift-schedule-modal-overlay" onClick={onCancel}>
      <div className="shift-schedule-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="shift-schedule-modal-header">{title}</h2>
        <div className="shift-schedule-modal-body">
          <div
            className="shift-schedule-form-group"
            style={{
              background: "#fff3e0",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ffb74d",
            }}
          >
            <p style={{ margin: 0, color: "#e65100" }}>{message}</p>
          </div>
        </div>
        <div className="shift-schedule-modal-actions">
          <button className="shift-schedule-btn shift-schedule-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="shift-schedule-btn shift-schedule-btn-warning" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Schedule() {
  const {
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
    autoAssignShifts,
    deleteWeek,
  } = useSchedules();

  const [selectedDate, setSelectedDate] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [selectedShiftForAssign, setSelectedShiftForAssign] = useState(null);
  const [autoAssignDate, setAutoAssignDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [registerConfirmOpen, setRegisterConfirmOpen] = useState(false);
  const [pendingShiftId, setPendingShiftId] = useState(null);

  const [autoAssignConfirmOpen, setAutoAssignConfirmOpen] = useState(false);
  const [autoAssignTargetMonday, setAutoAssignTargetMonday] = useState("");

  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast({ type: "warning", message });
    setTimeout(() => setToast(null), 4000);
  };

  const safeSchedules = Array.isArray(schedules) ? schedules : [];

  const getMondayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday.toISOString().split("T")[0];
  };

  const isMonday = (dateStr) => {
    const d = new Date(dateStr);
    return !Number.isNaN(d.getTime()) && d.getDay() === 1;
  };

  const mapAxiosError = (err, mondayHint, action) => {
    const st = err?.response?.status;
    const rawMsg =
      (err?.response?.data && (err.response.data.message || err.response.data.error)) || "";
    const msg = String(rawMsg).toLowerCase();

    if (msg.includes("already registered")) return "You have already registered for this shift.";
    if (msg.includes("already assigned")) return "Employee is already assigned to this shift.";
    if (msg.includes("start date must be monday"))
      return `Start date must be a MONDAY (YYYY-MM-DD). Suggestion: ${mondayHint || "pick the correct Monday"}.`;
    if (msg.includes("no shifts found")) return "No shifts found for this week.";
    if (msg.includes("shift not found")) return "Shift not found.";
    if (msg.includes("employee not found")) return "Employee not found.";
    if (msg.includes("registration not found")) return "Registration not found.";

    if (msg.includes("weekly shift limit exceeded")) return "You have exceeded the weekly shift limit (6 shifts).";
    if (msg.includes("weekly hour limit exceeded")) return "You have exceeded 40 working hours for the week.";
    if (msg.includes("shift time conflict")) return "This shift conflicts with another registered shift.";
    if (msg.includes("not enough rest time")) return "There must be at least 12 hours rest between shifts.";
    if (msg.includes("consecutive day limit exceeded")) return "You have exceeded the limit of 5 consecutive working days.";

    if (st === 400) {
      if (["create", "auto-assign", "delete", "load"].includes(action)) {
        return `Start date must be a MONDAY (YYYY-MM-DD). Suggestion: ${mondayHint || "pick the correct Monday"}.`;
      }
      return "Bad request. Please check your input.";
    }
    if (st === 401) return "Session expired. Please log in again.";
    if (st === 403) return "You don't have permission to perform this action.";
    if (st === 404)
      return `This week has not been created yet. ${
        userRole === "MANAGER" || userRole === "ADMIN" ? "Use Create Week." : "Contact your manager to create it."
      }`;
    if (st === 409) return "Week/Shift already exists or is full. Please reload and try a different option.";
    return "Unable to connect to the server. Please try again.";
  };

  const groupedShifts = safeSchedules.reduce((acc, shift) => {
    const date = shift.workDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(shift);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedShifts).sort();

  const handleLoadWeek = () => {
    if (selectedDate) {
      const monday = getMondayOfWeek(selectedDate);
      if (selectedDate !== monday) setSelectedDate(monday);
      loadSchedule(monday).catch((err) => {
        showToast(mapAxiosError(err, monday, "load"));
      });
    }
  };

  const handleWeekSelect = (monday) => {
    loadSchedule(monday).catch((err) => {
      showToast(mapAxiosError(err, monday, "load"));
    });
    setSidebarOpen(false);
  };

  const handleCreateWeek = () => {
    if (!selectedDate) return;
    const canCreate = userRole === "ADMIN" || userRole === "MANAGER";
    if (!canCreate) {
      showToast("Only MANAGER/ADMIN can create a week.");
      return;
    }
    const monday = getMondayOfWeek(selectedDate);
    if (selectedDate !== monday) setSelectedDate(monday);

    createSchedule(monday)
      .then(() => showSuccess("Schedule created successfully!"))
      .catch((err) => showToast(mapAxiosError(err, monday, "create")));
  };

  const handleOpenDeleteModal = () => {
    if (!(userRole === "ADMIN" || userRole === "MANAGER")) {
      showToast("Only MANAGER/ADMIN can delete a week.");
      return;
    }
    if (!selectedDate) {
      showToast("Please select a date.");
      return;
    }
    const monday = getMondayOfWeek(selectedDate);
    if (selectedDate !== monday) {
      showToast(`Delete works only on a MONDAY. Please choose the week's Monday: ${monday}.`);
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteWeek = async () => {
    const monday = selectedDate;
    if (typeof deleteWeek !== "function") {
      setShowDeleteModal(false);
      showToast("Delete week is not available in this version.");
      return;
    }
    try {
      await deleteWeek(monday);
      setShowDeleteModal(false);
      showSuccess(`Week ${monday} deleted.`);
      try {
        await loadSchedule(monday);
      } catch {}
    } catch (err) {
      setShowDeleteModal(false);
      showToast(mapAxiosError(err, monday, "delete"));
    }
  };

  const handleRegisterClick = (shiftId) => {
    setPendingShiftId(shiftId);
    setRegisterConfirmOpen(true);
  };
  const handleConfirmRegister = async () => {
    const shiftId = pendingShiftId;
    setRegisterConfirmOpen(false);
    setPendingShiftId(null);
    try {
      await registerShift(shiftId);
      showSuccess("Successfully registered for shift!");
    } catch (err) {
      showToast(mapAxiosError(err, undefined, "register"));
    }
  };

  const handleOpenAutoAssignModal = () => {
    setAutoAssignDate("");
    setAutoAssignConfirmOpen(false);
    setShowAutoAssignModal(true);
  };
  const handleAutoAssignSubmit = () => {
    if (!autoAssignDate) {
      showToast("Please select a date.");
      return;
    }
    const mondayDate = getMondayOfWeek(autoAssignDate);
    setAutoAssignTargetMonday(mondayDate);
    setAutoAssignConfirmOpen(true);
  };
  const handleConfirmAutoAssign = async () => {
    const mondayDate = autoAssignTargetMonday;
    setAutoAssignConfirmOpen(false);
    try {
      const result = await autoAssignShifts(mondayDate);
      showSuccess(`Auto-assigned ${result.assignedCount} shifts for week ${mondayDate}!`);
      setShowAutoAssignModal(false);
    } catch (err) {
      showToast(mapAxiosError(err, mondayDate, "auto-assign"));
    }
  };

  const handleAssignEmployee = async (employeeId, shiftId) => {
    try {
      await assignShift(employeeId, shiftId);
      showSuccess("Employee assigned to shift successfully!");
      setShowAssignModal(false);
      setSelectedShiftForAssign(null);
    } catch (err) {
      showToast(mapAxiosError(err, undefined, "assign"));
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (Number.isNaN(date.getTime())) return dateStr || "";
    return `${days[date.getDay()]}, ${date.toLocaleDateString()}`;
  };

  const isWeekend = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="schedule-main-container">
      <InlineToast toast={toast} onClose={() => setToast(null)} />

      <ScheduleSidebar
        createdWeeks={createdWeeks}
        currentWeekStart={currentWeekStart}
        onWeekSelect={handleWeekSelect}
        loading={loading}
      />

      <button
        className="schedule-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle calendar sidebar"
        title="Toggle calendar sidebar"
      >
        <Calendar />
      </button>

      <div className="shift-schedule-container">
        <div className="shift-schedule-header">
          <h1 className="shift-schedule-title">
            Work Schedule
            <span className={`shift-schedule-role-badge ${userRole.toLowerCase()}`}>{userRole}</span>
          </h1>
          <p className="shift-schedule-subtitle">Current Week: {currentWeekStart || "Loading..."}</p>

          <div className="shift-schedule-controls">
            <div className="shift-schedule-week-selector">
              <label>Select Monday:</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <button
                className="shift-schedule-btn shift-schedule-btn-primary shift-schedule-btn-small"
                onClick={handleLoadWeek}
                disabled={!selectedDate}
              >
                Load Week
              </button>
              <button
                className="shift-schedule-btn shift-schedule-btn-success shift-schedule-btn-small"
                onClick={handleCreateWeek}
                disabled={!selectedDate || loading || !(userRole === "ADMIN" || userRole === "MANAGER")}
                title={
                  userRole === "ADMIN" || userRole === "MANAGER"
                    ? "Create schedule for the week"
                    : "Only MANAGER/ADMIN can create weeks"
                }
              >
                Create Week
              </button>

              {(userRole === "ADMIN" || userRole === "MANAGER") && (
                <button
                  className="shift-schedule-btn shift-schedule-btn-secondary shift-schedule-btn-small"
                  onClick={handleOpenDeleteModal}
                  disabled={!selectedDate || loading}
                  title="Delete the selected week (Monday only)"
                  style={{ marginLeft: 8 }}
                >
                  <Trash2 style={{ verticalAlign: "middle" }} /> Delete Week
                </button>
              )}
            </div>

            {(userRole === "ADMIN" || userRole === "MANAGER") && (
              <button
                className="shift-schedule-btn shift-schedule-btn-warning"
                onClick={handleOpenAutoAssignModal}
                disabled={loading}
                title="Auto assign available employees to shifts"
              >
                <Bot style={{ verticalAlign: "middle", marginRight: 8 }} /> Auto Assign Shifts
              </button>
            )}
          </div>

          {successMessage && <div className="shift-schedule-success-message">{successMessage}</div>}
          {error && !/status code \d+/.test(error) && <div className="shift-schedule-error-message">{error}</div>}
        </div>

        {loading ? (
          <div className="shift-schedule-loading-container">
            <div className="shift-schedule-loading-spinner"></div>
            <p>Loading schedule...</p>
          </div>
        ) : safeSchedules.length === 0 ? (
          <div className="shift-schedule-empty-state">
            <div className="shift-schedule-empty-state-icon">
              <Calendar />
            </div>
            <h2>No schedule found</h2>
            <p>Please select a Monday date and create a schedule</p>
          </div>
        ) : (
          <div className="shift-schedule-grid">
            {sortedDates.map((date) => (
              <div key={date} className="shift-schedule-day-section">
                <div className="shift-schedule-day-header">
                  <div>
                    <h2 className="shift-schedule-day-title">{formatDate(date)}</h2>
                    <p className="shift-schedule-day-date">{date}</p>
                  </div>
                  {isWeekend(date) && (
                    <span className="shift-schedule-weekend-badge">Weekend</span>
                  )}
                </div>

                <div className="shift-schedule-shifts-list">
                  {groupedShifts[date].map((shift) => (
                    <div key={shift.shiftId} className="shift-schedule-shift-card">
                      <div className="shift-schedule-shift-header">
                        <div>
                          <h3 className="shift-schedule-shift-name">{shift.name}</h3>
                          <p className="shift-schedule-shift-time">
                            <Clock size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                            {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="shift-schedule-shift-details">
                            <FileText size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                            {shift.note || "No additional notes"}
                          </p>
                        </div>
                        <span className={`shift-schedule-shift-status ${shift.shiftStatus.toLowerCase()}`}>
                          {shift.shiftStatus}
                        </span>
                      </div>

                      <div className="shift-schedule-shift-actions">
                        {userRole === "STAFF" && (
                          <button
                            className="shift-schedule-btn shift-schedule-btn-primary shift-schedule-btn-small"
                            onClick={() => handleRegisterClick(shift.shiftId)}
                            disabled={loading || shift.shiftStatus === "FULL"}
                          >
                            <UserPlus size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                            Register
                          </button>
                        )}

                        {userRole === "MANAGER" && (
                          <>
                            <button
                              className="shift-schedule-btn shift-schedule-btn-primary shift-schedule-btn-small"
                              onClick={() => handleRegisterClick(shift.shiftId)}
                              disabled={loading || shift.shiftStatus === "FULL"}
                            >
                              <UserPlus size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                              Register Self
                            </button>
                            <button
                              className="shift-schedule-btn shift-schedule-btn-success shift-schedule-btn-small"
                              onClick={() => {
                                setShowAssignModal(true);
                                setSelectedShiftForAssign(shift);
                              }}
                              disabled={loading || shift.shiftStatus === "FULL"}
                            >
                              <Users size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                              Assign Employee
                            </button>
                          </>
                        )}

                        {shift.shiftStatus === "FULL" && (
                          <span style={{ color: "#a8e063", fontSize: "0.85rem", fontStyle: "italic" }}>
                            <CheckCircle2 size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                            Shift is full
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <AssignStaff
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedShiftForAssign(null);
          }}
          shift={selectedShiftForAssign}
          onAssign={handleAssignEmployee}
          isLoading={loading}
          weekStart={currentWeekStart}
        />

        {showAutoAssignModal && (
          <div className="shift-schedule-modal-overlay" onClick={() => setShowAutoAssignModal(false)}>
            <div className="shift-schedule-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="shift-schedule-modal-header">
                <Bot style={{ verticalAlign: "middle", marginRight: 8 }} /> Auto Assign Shifts
              </h2>

              <div className="shift-schedule-modal-body">
                <div className="shift-schedule-form-group">
                  <label>Select any date in the target week: *</label>
                  <input
                    type="date"
                    placeholder="Select a date"
                    value={autoAssignDate}
                    onChange={(e) => setAutoAssignDate(e.target.value)}
                    autoFocus
                  />
                  <small style={{ color: "#666", marginTop: "5px", display: "block" }}>
                    The system will automatically target the Monday of the selected week
                  </small>
                </div>

                {autoAssignDate && (
                  <div
                    className="shift-schedule-form-group"
                    style={{
                      background: "#e3f2fd",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #90caf9",
                    }}
                  >
                    <label style={{ color: "#1976d2", fontWeight: "600" }}>
                      <Calendar size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                      Target Week Start (Monday):
                    </label>
                    <div style={{ fontSize: "1.1rem", color: "#0d47a1", fontWeight: "bold", marginTop: "5px" }}>
                      {getMondayOfWeek(autoAssignDate)}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    background: "#fff3e0",
                    padding: "12px",
                    borderRadius: "8px",
                    marginTop: "15px",
                    border: "1px solid #ffb74d",
                  }}
                >
                  <p style={{ margin: 0, color: "#e65100", fontSize: "0.9rem" }}>
                    <AlertTriangle size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    <strong>Note:</strong> This will automatically assign available employees to all shifts in the
                    selected week based on availability and working-hour limits.
                  </p>
                </div>
              </div>

              <div className="shift-schedule-modal-actions">
                <button
                  className="shift-schedule-btn shift-schedule-btn-secondary"
                  onClick={() => setShowAutoAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="shift-schedule-btn shift-schedule-btn-warning"
                  onClick={handleAutoAssignSubmit}
                  disabled={!autoAssignDate || loading}
                >
                  <Bot size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                  Auto Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="shift-schedule-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="shift-schedule-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="shift-schedule-modal-header">
                <Trash2 style={{ verticalAlign: "middle", marginRight: 8 }} /> Delete Week
              </h2>
              <div className="shift-schedule-modal-body">
                <div
                  className="shift-schedule-form-group"
                  style={{ background: "#ffebee", padding: "12px", borderRadius: "8px", border: "1px solid #ef9a9a" }}
                >
                  <p style={{ margin: 0, color: "#b71c1c" }}>
                    You are about to <strong>delete the entire week</strong> starting <strong>{selectedDate}</strong>. This action{" "}
                    <strong>cannot be undone</strong>. Please confirm to proceed.
                  </p>
                </div>
              </div>
              <div className="shift-schedule-modal-actions">
                <button className="shift-schedule-btn shift-schedule-btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="shift-schedule-btn shift-schedule-btn-warning" onClick={handleConfirmDeleteWeek} disabled={loading}>
                  <Trash2 size={14} style={{ verticalAlign: "middle", marginRight: 8 }} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          open={registerConfirmOpen}
          title={<><UserPlus style={{ verticalAlign: "middle", marginRight: 8 }} /> Confirm Registration</>}
          message="Are you sure you want to register for this shift?"
          confirmText="Register"
          onConfirm={handleConfirmRegister}
          onCancel={() => {
            setRegisterConfirmOpen(false);
            setPendingShiftId(null);
          }}
        />

        <ConfirmModal
          open={autoAssignConfirmOpen}
          title={<><Bot style={{ verticalAlign: "middle", marginRight: 8 }} /> Confirm Auto-Assign</>}
          message={`The system will auto-assign employees for the week starting ${autoAssignTargetMonday}. Proceed?`}
          confirmText="Run Auto-Assign"
          onConfirm={handleConfirmAutoAssign}
          onCancel={() => setAutoAssignConfirmOpen(false)}
        />
      </div>
    </div>
  );
}

export default Schedule;
