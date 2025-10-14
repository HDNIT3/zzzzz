import React, { useState } from "react";
import { useSchedules } from "../hooks/useSchedules";
import { AssignStaff } from "../components/modals/operation/AssignStaff";
import { ScheduleSidebar } from "../components/modals/operation/ScheduleSidebar";
import "../styles/schedule.css";

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
  } = useSchedules();

  const [selectedDate, setSelectedDate] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [selectedShiftForAssign, setSelectedShiftForAssign] = useState(null);
  const [autoAssignDate, setAutoAssignDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const safeSchedules = Array.isArray(schedules) ? schedules : [];

  const getMondayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday.toISOString().split("T")[0];
  };

  const groupedShifts = safeSchedules.reduce((acc, shift) => {
    const date = shift.workDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedShifts).sort();

  const handleLoadWeek = () => {
    if (selectedDate) {
      loadSchedule(selectedDate).catch((err) => {
        alert(err.message || "Failed to load schedule");
      });
    }
  };

  const handleWeekSelect = (monday) => {
    loadSchedule(monday).catch((err) => {
      alert(err.message || "Failed to load schedule");
    });
    setSidebarOpen(false);
  };

  const handleCreateWeek = () => {
    if (selectedDate) {
      createSchedule(selectedDate)
        .then(() => {
          showSuccess("Schedule created successfully!");
        })
        .catch((err) => {
          alert(err.message || "Failed to create schedule");
        });
    }
  };

  const handleRegister = (shiftId) => {
    if (window.confirm("Do you want to register for this shift?")) {
      registerShift(shiftId)
        .then(() => {
          showSuccess("Successfully registered for shift!");
        })
        .catch((err) => {
          alert(err.message || "Failed to register");
        });
    }
  };

  const handleOpenAssignModal = (shift) => {
    setSelectedShiftForAssign(shift);
    setShowAssignModal(true);
  };

  const handleAssignEmployee = (employeeId, shiftId) => {
    assignShift(employeeId, shiftId)
      .then(() => {
        showSuccess("Successfully assigned employee to shift!");
        setShowAssignModal(false);
        setSelectedShiftForAssign(null);
      })
      .catch((err) => {
        console.error("Assign error:", err);
        alert(err.message || "Failed to assign");
      });
  };

  const handleOpenAutoAssignModal = () => {
    setAutoAssignDate("");
    setShowAutoAssignModal(true);
  };

  const handleAutoAssignSubmit = () => {
    if (!autoAssignDate) {
      alert("Please select a date");
      return;
    }

    const mondayDate = getMondayOfWeek(autoAssignDate);
    
    if (window.confirm(`Auto-assign shifts for the week starting ${mondayDate}?`)) {
      autoAssignShifts(mondayDate)
        .then((result) => {
          showSuccess(
            `Auto-assigned ${result.assignedCount} shifts successfully for week ${mondayDate}!`
          );
          setShowAutoAssignModal(false);
        })
        .catch((err) => {
          alert(err.message || "Failed to auto-assign");
        });
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[date.getDay()]}, ${date.toLocaleDateString()}`;
  };

  const isWeekend = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="schedule-main-container">
      {/* Sidebar */}
      <ScheduleSidebar
        createdWeeks={createdWeeks}
        currentWeekStart={currentWeekStart}
        onWeekSelect={handleWeekSelect}
        loading={loading}
      />

      {/* Mobile Sidebar Toggle */}
      <button 
        className="schedule-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        📅
      </button>

      {/* Main Content */}
      <div className="shift-schedule-container">
        <div className="shift-schedule-header">
          <h1 className="shift-schedule-title">
            Work Schedule
            <span className={`shift-schedule-role-badge ${userRole.toLowerCase()}`}>
              {userRole}
            </span>
          </h1>
          <p className="shift-schedule-subtitle">
            Current Week: {currentWeekStart || "Loading..."}
          </p>

          <div className="shift-schedule-controls">
            <div className="shift-schedule-week-selector">
              <label>Select Monday:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
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
                disabled={!selectedDate}
              >
                Create Week
              </button>
            </div>

            {(userRole === "ADMIN" || userRole === "MANAGER") && (
              <button
                className="shift-schedule-btn shift-schedule-btn-warning"
                onClick={handleOpenAutoAssignModal}
                disabled={loading}
              >
                🤖 Auto Assign Shifts
              </button>
            )}
          </div>

          {successMessage && (
            <div className="shift-schedule-success-message">{successMessage}</div>
          )}
          {error && <div className="shift-schedule-error-message">{error}</div>}
        </div>

        {loading ? (
          <div className="shift-schedule-loading-container">
            <div className="shift-schedule-loading-spinner"></div>
            <p>Loading schedule...</p>
          </div>
        ) : safeSchedules.length === 0 ? (
          <div className="shift-schedule-empty-state">
            <div className="shift-schedule-empty-state-icon">📅</div>
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
                            ⏰ {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="shift-schedule-shift-details">
                            📋 {shift.note || "No additional notes"}
                          </p>
                        </div>
                        <span
                          className={`shift-schedule-shift-status ${shift.shiftStatus.toLowerCase()}`}
                        >
                          {shift.shiftStatus}
                        </span>
                      </div>

                      <div className="shift-schedule-shift-actions">
                        {userRole === "STAFF" && (
                          <button
                            className="shift-schedule-btn shift-schedule-btn-primary shift-schedule-btn-small"
                            onClick={() => handleRegister(shift.shiftId)}
                            disabled={loading || shift.shiftStatus === "FULL"}
                          >
                            ✋ Register
                          </button>
                        )}

                        {userRole === "MANAGER" && (
                          <>
                            <button
                              className="shift-schedule-btn shift-schedule-btn-primary shift-schedule-btn-small"
                              onClick={() => handleRegister(shift.shiftId)}
                              disabled={loading || shift.shiftStatus === "FULL"}
                            >
                              ✋ Register Self
                            </button>
                            <button
                              className="shift-schedule-btn shift-schedule-btn-success shift-schedule-btn-small"
                              onClick={() => handleOpenAssignModal(shift)}
                              disabled={loading || shift.shiftStatus === "FULL"}
                            >
                              👥 Assign Employee
                            </button>
                          </>
                        )}

                        {shift.shiftStatus === "FULL" && (
                          <span
                            style={{
                              color: "#a8e063",
                              fontSize: "0.85rem",
                              fontStyle: "italic",
                            }}
                          >
                            ✓ Shift is full
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
          <div 
            className="shift-schedule-modal-overlay" 
            onClick={() => setShowAutoAssignModal(false)}
          >
            <div className="shift-schedule-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="shift-schedule-modal-header">🤖 Auto Assign Shifts</h2>
              
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
                  <div className="shift-schedule-form-group" style={{ 
                    background: "#e3f2fd", 
                    padding: "12px", 
                    borderRadius: "8px",
                    border: "1px solid #90caf9"
                  }}>
                    <label style={{ color: "#1976d2", fontWeight: "600" }}>
                      📅 Target Week Start (Monday):
                    </label>
                    <div style={{ 
                      fontSize: "1.1rem", 
                      color: "#0d47a1",
                      fontWeight: "bold",
                      marginTop: "5px"
                    }}>
                      {getMondayOfWeek(autoAssignDate)}
                    </div>
                  </div>
                )}

                <div style={{ 
                  background: "#fff3e0", 
                  padding: "12px", 
                  borderRadius: "8px",
                  marginTop: "15px",
                  border: "1px solid #ffb74d"
                }}>
                  <p style={{ margin: 0, color: "#e65100", fontSize: "0.9rem" }}>
                    ⚠️ <strong>Note:</strong> This will automatically assign available employees 
                    to all shifts in the selected week based on their availability and working hour limits.
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
                  🤖 Auto Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}