import React, { useState } from "react";
import { useSchedules } from "../hooks/useSchedules";
import "../styles/schedule.css";

export function Schedule() {
  const {
    schedules,
    loading,
    error,
    currentWeekStart,
    userRole,
    loadSchedule,
    createSchedule,
    registerShift,
    assignShift,
    autoAssignShifts,
  } = useSchedules();

  const [selectedDate, setSelectedDate] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShiftForAssign, setSelectedShiftForAssign] = useState(null);
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Ensure schedules is always an array
  const safeSchedules = Array.isArray(schedules) ? schedules : [];

  // Group shifts by date
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
    console.log("Opening assign modal for shift:", shift);
    console.log("Current user role:", userRole);
    setSelectedShiftForAssign(shift);
    setEmployeeIdInput("");
    setShowAssignModal(true);
    console.log("Modal state set to true");
  };

  const handleAssignSubmit = () => {
    console.log("Assign submit clicked");
    console.log("Employee ID:", employeeIdInput);
    console.log("Shift:", selectedShiftForAssign);
    
    if (!employeeIdInput) {
      alert("Please enter Employee ID");
      return;
    }

    assignShift(employeeIdInput, selectedShiftForAssign.shiftId)
      .then(() => {
        showSuccess("Successfully assigned employee to shift!");
        setShowAssignModal(false);
      })
      .catch((err) => {
        console.error("Assign error:", err);
        alert(err.message || "Failed to assign");
      });
  };

  const handleAutoAssign = () => {
    if (window.confirm("Auto-assign shifts for this week?")) {
      autoAssignShifts(currentWeekStart)
        .then((result) => {
          showSuccess(
            `Auto-assigned ${result.assignedCount} shifts successfully!`
          );
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

  console.log("Render - showAssignModal:", showAssignModal);
  console.log("Render - selectedShiftForAssign:", selectedShiftForAssign);
  console.log("Render - userRole:", userRole);

  return (
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
              onClick={handleAutoAssign}
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
                      {/* STAFF: Only register */}
                      {userRole === "STAFF" && (
                        <button
                          className="shift-schedule-btn shift-schedule-btn-primary shift-schedule-btn-small"
                          onClick={() => handleRegister(shift.shiftId)}
                          disabled={loading || shift.shiftStatus === "FULL"}
                        >
                          ✋ Register
                        </button>
                      )}

                      {/* MANAGER: Register + Assign */}
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

                      {/* Show status info for all roles */}
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

      {/* Assign Modal for MANAGER */}
      {showAssignModal && selectedShiftForAssign && (
        <div 
          className="shift-schedule-modal-overlay" 
          onClick={() => setShowAssignModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.8)'
          }}
        >
          <div className="shift-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="shift-schedule-modal-header">Assign Employee to Shift</h2>
            
            <div className="shift-schedule-modal-body">
              <div className="shift-schedule-form-group">
                <label>Shift:</label>
                <input
                  type="text"
                  value={selectedShiftForAssign.name}
                  disabled
                />
              </div>

              <div className="shift-schedule-form-group">
                <label>Time:</label>
                <input
                  type="text"
                  value={`${selectedShiftForAssign.startTime} - ${selectedShiftForAssign.endTime}`}
                  disabled
                />
              </div>

              <div className="shift-schedule-form-group">
                <label>Employee ID: *</label>
                <input
                  type="text"
                  placeholder="Enter employee ID"
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="shift-schedule-modal-actions">
              <button
                className="shift-schedule-btn shift-schedule-btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className="shift-schedule-btn shift-schedule-btn-success"
                onClick={handleAssignSubmit}
                disabled={!employeeIdInput || loading}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}