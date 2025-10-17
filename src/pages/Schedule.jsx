import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  UserMinus,
} from "lucide-react";

/* ============= Toast Component ============= */
function InlineToast({ toast, onClose }) {
  if (!toast) return null;
  const palette = {
    warning: { bg: "rgba(255,193,7,0.12)", bd: "#FFC107", fg: "#B28704", Icon: AlertTriangle },
    success: { bg: "rgba(76,175,80,0.12)", bd: "#4CAF50", fg: "#2E7D32", Icon: CheckCircle2 },
    error: { bg: "rgba(244,67,54,0.12)", bd: "#F44336", fg: "#C62828", Icon: X },
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
      <Icon size={18} />
      <div style={{ fontSize: 14, lineHeight: "20px", flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>
          {toast.type === "success" ? "Success" : toast.type === "error" ? "Error" : "Notification"}
        </div>
        <div>{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          background: "transparent",
          border: 0,
          color: c.fg,
          cursor: "pointer",
          padding: 0,
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}

/* ============= Confirm Modal Component ============= */
function ConfirmModal({ open, title, message, confirmText = "Confirm", variant = "warning", onConfirm, onCancel }) {
  if (!open) return null;
  
  const variants = {
    warning: { bg: "#fff3e0", border: "#ffb74d", color: "#e65100" },
    danger: { bg: "#ffebee", border: "#ef9a9a", color: "#b71c1c" },
  };
  const style = variants[variant] || variants.warning;
  
  return (
    <div className="shift-schedule-modal-overlay" onClick={onCancel}>
      <div className="shift-schedule-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="shift-schedule-modal-header">{title}</h2>
        <div className="shift-schedule-modal-body">
          <div
            className="shift-schedule-form-group"
            style={{
              background: style.bg,
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${style.border}`,
            }}
          >
            <p style={{ margin: 0, color: style.color }}>{message}</p>
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

/* ============= Helper Functions ============= */
const DATE_RE = /(\d{4}-\d{2}-\d{2})/;

function extractDateFromName(name) {
  if (!name) return "";
  const m = String(name).match(DATE_RE);
  return m ? m[1] : "";
}

function safeWorkDate(shift) {
  return shift?.workDate || extractDateFromName(shift?.name) || "";
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[d.getDay()]}, ${d.toLocaleDateString()}`;
}

function fmtTime(t) {
  if (!t) return "";
  const parts = String(t).split(":");
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
}

function isWeekendDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function getMondayOfWeek(dateStr) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

function mapAxiosError(err, mondayHint, action) {
  const st = err?.response?.status;
  const rawMsg = err?.response?.data?.message || err?.response?.data?.error || "";
  const msg = String(rawMsg).toLowerCase();

  // Specific error messages
  if (msg.includes("already registered")) return "You have already registered for this shift.";
  if (msg.includes("already assigned")) return "Employee is already assigned to this shift.";
  if (msg.includes("start date must be monday"))
    return `Start date must be a MONDAY (YYYY-MM-DD). Try: ${mondayHint || "select Monday"}.`;
  if (msg.includes("no shifts found")) return "No shifts found for this week.";
  if (msg.includes("shift not found")) return "Shift not found.";
  if (msg.includes("employee not found")) return "Employee not found.";
  if (msg.includes("registration not found")) return "Registration not found or already cancelled.";
  if (msg.includes("weekly shift limit exceeded")) return "Weekly shift limit exceeded (max 6 shifts).";
  if (msg.includes("weekly hour limit exceeded")) return "Weekly hour limit exceeded (max 40 hours).";
  if (msg.includes("shift time conflict")) return "This shift conflicts with another registered shift.";
  if (msg.includes("not enough rest time")) return "Need at least 12 hours rest between shifts.";
  if (msg.includes("consecutive day limit exceeded")) return "Max 5 consecutive working days exceeded.";

  // HTTP status codes
  if (st === 400) return "Bad request. Please check your input.";
  if (st === 401) return "Session expired. Please log in again.";
  if (st === 403) return "You don't have permission to perform this action.";
  if (st === 404) return "Week not found. Please create the week first.";
  if (st === 409) return "Conflict: Week/Shift already exists or is full.";
  
  return err?.message || "Unable to connect to server. Please try again.";
}

/* ============= Main Component ============= */
export function Schedule() {
  const navigate = useNavigate();
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
    cancelShift,
    autoAssignShifts,
    deleteWeek,
  } = useSchedules();

  // States
  const [selectedDate, setSelectedDate] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [selectedShiftForAssign, setSelectedShiftForAssign] = useState(null);
  const [autoAssignDate, setAutoAssignDate] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [registerConfirmOpen, setRegisterConfirmOpen] = useState(false);
  const [pendingShiftId, setPendingShiftId] = useState(null);
  const [autoAssignConfirmOpen, setAutoAssignConfirmOpen] = useState(false);
  const [autoAssignTargetMonday, setAutoAssignTargetMonday] = useState("");
  
  // NEW: Cancel shift states
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [pendingCancelRegistrationId, setPendingCancelRegistrationId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "warning") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Process schedules
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const normalized = safeSchedules.map((s) => ({
    ...s,
    _workDate: safeWorkDate(s),
  }));

  const groupedShifts = normalized.reduce((acc, shift) => {
    const date = shift._workDate || "(unknown)";
    if (!acc[date]) acc[date] = [];
    acc[date].push(shift);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedShifts).sort((a, b) => {
    if (a === "(unknown)" && b === "(unknown)") return 0;
    if (a === "(unknown)") return 1;
    if (b === "(unknown)") return -1;
    return new Date(a) - new Date(b);
  });

  /* ============= Event Handlers ============= */
  const handleLoadWeek = () => {
    if (selectedDate) {
      const monday = getMondayOfWeek(selectedDate);
      if (selectedDate !== monday) setSelectedDate(monday);
      loadSchedule(monday).catch((err) => {
        showToast(mapAxiosError(err, monday, "load"), "error");
      });
    }
  };

  const handleWeekSelect = (monday) => {
    loadSchedule(monday).catch((err) => {
      showToast(mapAxiosError(err, monday, "load"), "error");
    });
    setSidebarOpen(false);
  };

  const handleCreateWeek = () => {
    if (!selectedDate) return;
    const canCreate = userRole === "ADMIN" || userRole === "MANAGER";
    if (!canCreate) {
      showToast("Only MANAGER/ADMIN can create a week.", "warning");
      return;
    }
    const monday = getMondayOfWeek(selectedDate);
    if (selectedDate !== monday) setSelectedDate(monday);

    createSchedule(monday)
      .then(() => showToast("Schedule created successfully!", "success"))
      .catch((err) => showToast(mapAxiosError(err, monday, "create"), "error"));
  };

  const handleOpenDeleteModal = () => {
    if (!(userRole === "ADMIN" || userRole === "MANAGER")) {
      showToast("Only MANAGER/ADMIN can delete a week.", "warning");
      return;
    }
    if (!selectedDate) {
      showToast("Please select a date.", "warning");
      return;
    }
    const monday = getMondayOfWeek(selectedDate);
    if (selectedDate !== monday) {
      showToast(`Delete works only on MONDAY. Try: ${monday}`, "warning");
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteWeek = async () => {
    const monday = selectedDate;
    try {
      await deleteWeek(monday);
      setShowDeleteModal(false);
      showToast(`Week ${monday} deleted successfully!`, "success");
      try {
        await loadSchedule(monday);
      } catch {}
    } catch (err) {
      setShowDeleteModal(false);
      showToast(mapAxiosError(err, monday, "delete"), "error");
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
      showToast("Successfully registered for shift!", "success");
    } catch (err) {
      showToast(mapAxiosError(err, undefined, "register"), "error");
    }
  };

  // NEW: Cancel shift handlers
  const handleCancelClick = (registrationId) => {
    setPendingCancelRegistrationId(registrationId);
    setCancelConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    const registrationId = pendingCancelRegistrationId;
    setCancelConfirmOpen(false);
    setPendingCancelRegistrationId(null);
    try {
      await cancelShift(registrationId);
      showToast("Shift cancelled successfully!", "success");
    } catch (err) {
      showToast(mapAxiosError(err, undefined, "cancel"), "error");
    }
  };

  const handleOpenAutoAssignModal = () => {
    setAutoAssignDate("");
    setAutoAssignConfirmOpen(false);
    setShowAutoAssignModal(true);
  };

  const handleAutoAssignSubmit = () => {
    if (!autoAssignDate) {
      showToast("Please select a date.", "warning");
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
      showToast(`Auto-assigned ${result.assignedCount} shifts for week ${mondayDate}!`, "success");
      setShowAutoAssignModal(false);
    } catch (err) {
      showToast(mapAxiosError(err, mondayDate, "auto-assign"), "error");
    }
  };

  const handleAssignEmployee = async (employeeId, shiftId) => {
    try {
      await assignShift(employeeId, shiftId);
      showToast("Employee assigned to shift successfully!", "success");
      setShowAssignModal(false);
      setSelectedShiftForAssign(null);
    } catch (err) {
      showToast(mapAxiosError(err, undefined, "assign"), "error");
    }
  };

  /* ============= Render ============= */
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

            {(userRole === "STAFF"|| userRole === "MANAGER") && (
              <button
                className="shift-schedule-btn shift-schedule-btn-secondary"
                onClick={() => navigate("/my-shifts")}
                title="View my registered shifts timeline"
                style={{ marginLeft: 8 }}
              >
                📅 View My Shifts
              </button>
            )}
          </div>

          {error && !/status code \d+/.test(error) && <div className="shift-schedule-error-message">{error}</div>}
        </div>

        {loading ? (
          <div className="shift-schedule-loading-container">
            <div className="shift-schedule-loading-spinner"></div>
            <p>Loading schedule...</p>
          </div>
        ) : normalized.length === 0 ? (
          <div className="shift-schedule-empty-state">
            <div className="shift-schedule-empty-state-icon">
              <Calendar />
            </div>
            <h2>No schedule found</h2>
            <p>Please select a Monday date and create a schedule</p>
          </div>
        ) : (
          <div className="shift-schedule-grid">
            {sortedDates.map((dateKey) => (
              <div key={dateKey} className="shift-schedule-day-section">
                <div className="shift-schedule-day-header">
                  <div>
                    <h2 className="shift-schedule-day-title">{fmtDate(dateKey) || "(unknown date)"}</h2>
                    <p className="shift-schedule-day-date">{dateKey || ""}</p>
                  </div>
                  {dateKey && isWeekendDate(dateKey) && <span className="shift-schedule-weekend-badge">Weekend</span>}
                </div>

                <div className="shift-schedule-shifts-list">
                  {groupedShifts[dateKey].map((shift) => {
                    const isRegistered = shift.registrations?.some(
                      (reg) => reg.userId === localStorage.getItem("accountId") || reg.userId === sessionStorage.getItem("accountId")
                    );
                    const myRegistration = shift.registrations?.find(
                      (reg) => reg.userId === localStorage.getItem("accountId") || reg.userId === sessionStorage.getItem("accountId")
                    );

                    return (
                      <div key={shift.shiftId} className="shift-schedule-shift-card">
                        <div className="shift-schedule-shift-header">
                          <div>
                            <h3 className="shift-schedule-shift-name">{shift.name}</h3>
                            <p className="shift-schedule-shift-time">
                              <Clock size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                              {fmtTime(shift.startTime)} - {fmtTime(shift.endTime)}
                            </p>
                            <p className="shift-schedule-shift-details">
                              <FileText size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                              {shift.note || "No additional notes"}
                            </p>
                            {shift.registeredCount !== undefined && (
                              <p className="shift-schedule-shift-details" style={{ color: "#666", fontSize: "0.85rem" }}>
                                <Users size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                                Registered: {shift.registeredCount} / {shift.requiredStaff || "N/A"}
                              </p>
                            )}
                          </div>
                          <span className={`shift-schedule-shift-status ${String(shift.shiftStatus || "").toLowerCase()}`}>
                            {shift.shiftStatus || "UNKNOWN"}
                          </span>
                        </div>

                        <div className="shift-schedule-shift-actions">
                          {userRole === "STAFF" && (
                            <>
                              {!isRegistered ? (
                                <button
                                  className="shift-schedule-btn shift-schedule-btn-primary shift-schedule-btn-small"
                                  onClick={() => handleRegisterClick(shift.shiftId)}
                                  disabled={loading || shift.shiftStatus === "FULL"}
                                >
                                  <UserPlus size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                                  Register
                                </button>
                              ) : (
                                <button
                                  className="shift-schedule-btn shift-schedule-btn-warning shift-schedule-btn-small"
                                  onClick={() => handleCancelClick(myRegistration?.registrationId)}
                                  disabled={loading || !myRegistration?.registrationId}
                                  title="Cancel your registration"
                                >
                                  <UserMinus size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                                  Cancel Registration
                                </button>
                              )}
                            </>
                          )}

                          {userRole === "MANAGER" && (
                            <>
                              {!isRegistered ? (
                                <button
                                  className="shift-schedule-btn shift-schedule-btn-primary shift-schedule-btn-small"
                                  onClick={() => handleRegisterClick(shift.shiftId)}
                                  disabled={loading || shift.shiftStatus === "FULL"}
                                >
                                  <UserPlus size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                                  Register Self
                                </button>
                              ) : (
                                <button
                                  className="shift-schedule-btn shift-schedule-btn-warning shift-schedule-btn-small"
                                  onClick={() => handleCancelClick(myRegistration?.registrationId)}
                                  disabled={loading || !myRegistration?.registrationId}
                                >
                                  <UserMinus size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />
                                  Cancel
                                </button>
                              )}
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
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Staff Modal */}
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

        {/* Auto Assign Modal */}
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

        {/* Delete Week Modal */}
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

        {/* Register Confirmation Modal */}
        <ConfirmModal
          open={registerConfirmOpen}
          title={<><UserPlus style={{ verticalAlign: "middle", marginRight: 8 }} /> Confirm Registration</>}
          message="Are you sure you want to register for this shift?"
          confirmText="Register"
          variant="warning"
          onConfirm={handleConfirmRegister}
          onCancel={() => {
            setRegisterConfirmOpen(false);
            setPendingShiftId(null);
          }}
        />

        {/* Cancel Registration Confirmation Modal */}
        <ConfirmModal
          open={cancelConfirmOpen}
          title={<><UserMinus style={{ verticalAlign: "middle", marginRight: 8 }} /> Cancel Registration</>}
          message="Are you sure you want to cancel your registration for this shift? This action cannot be undone."
          confirmText="Yes, Cancel"
          variant="danger"
          onConfirm={handleConfirmCancel}
          onCancel={() => {
            setCancelConfirmOpen(false);
            setPendingCancelRegistrationId(null);
          }}
        />

        {/* Auto Assign Confirmation Modal */}
        <ConfirmModal
          open={autoAssignConfirmOpen}
          title={<><Bot style={{ verticalAlign: "middle", marginRight: 8 }} /> Confirm Auto-Assign</>}
          message={`The system will auto-assign employees for the week starting ${autoAssignTargetMonday}. Proceed?`}
          confirmText="Run Auto-Assign"
          variant="warning"
          onConfirm={handleConfirmAutoAssign}
          onCancel={() => setAutoAssignConfirmOpen(false)}
        />
      </div>
    </div>
  );
}

export default Schedule;