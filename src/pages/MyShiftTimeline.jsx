import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/myshift.timeline.css"; // <-- quan trọng: import CSS mới

/* API base */
const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  "http://localhost:8080";

/* Lấy token từ nhiều nơi */
function getTokenFromStorage() {
  const keys = ["token", "accessToken", "jwt", "authToken", "Authorization", "access_token"];
  for (const k of keys) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (v) return v.startsWith("Bearer ") ? v.replace(/^Bearer\s+/i, "") : v;
  }
  try {
    const parts = (document.cookie || "").split(";").map((s) => s.trim());
    for (const p of parts) {
      const [name, val] = p.split("=");
      if (!name || !val) continue;
      if (keys.includes(name)) return decodeURIComponent(val);
    }
  } catch {}
  return null;
}

/* Formatters */
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString("vi-VN");
}
function fmtTime(t) {
  if (!t) return "—";
  const parts = String(t).split(":");
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
}

/* Chip trạng thái */
function StatusChip({ status }) {
  const s = String(status || "").toUpperCase();
  return (
    <span className={`mst-chip mst-${s || "EMPTY"}`} title={`Status: ${s}`}>
      {s || "—"}
    </span>
  );
}

export default function MyShiftTimeline() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getTokenFromStorage();
    const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

    axios
      .get(`${API_BASE}/api/shifts/registered`, cfg)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        data.sort((a, b) => {
          const da = `${a?.workDate ?? ""} ${a?.startTime ?? ""}`;
          const db = `${b?.workDate ?? ""} ${b?.startTime ?? ""}`;
          return new Date(da) - new Date(db);
        });
        setItems(data);
      })
      .catch((e) => {
        const status = e?.response?.status;
        let msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Không thể tải dữ liệu.";
        if (status === 401) msg = "Thiếu/không hợp lệ token. Vui lòng đăng nhập lại.";
        if (status === 403) msg = "Chỉ STAFF được phép xem timeline.";
        setErr(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mst-wrap">
      <div className="mst-head">
        <h2 className="mst-title"><span role="img" aria-label="calendar">📅</span> Lịch đã đăng ký của tôi</h2>
        <button className="mst-back" onClick={() => navigate("/sched")} title="Quay về trang Schedule">← Go back</button>
      </div>

      {loading && <div className="mst-info">Đang tải...</div>}
      {!loading && err && <div className="mst-error">{err}</div>}
      {!loading && !err && items.length === 0 && (
        <div className="mst-empty">Bạn chưa đăng ký ca nào.</div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="mst-grid">
          {items.map((s, idx) => {
            const workDate = s?.workDate || s?.date || null;
            const start = s?.startTime || "";
            const end = s?.endTime || "";
            const isWeekend = s?.isWeekend ?? s?.weekend ?? false;

            return (
              <div key={idx} className="mst-card">
                <div className="mst-cardHeader">
                  <div className="mst-titleBox">
                    <span
                      className="mst-dot"
                      style={{ background: isWeekend ? "#ef4444" : "#3b82f6" }}
                    />
                    <div className="mst-name">{s?.name || "Ca làm việc"}</div>
                  </div>

                  <div className="mst-meta">
                    <StatusChip status={s?.shiftStatus} />
                    <div>🗓 <b>{fmtDate(workDate)}</b></div>
                    <div>⏰ <b>{fmtTime(start)}–{fmtTime(end)}</b></div>
                  </div>
                </div>

                <div className="mst-body">
                  <div className="mst-note">
                    Ghi chú: <b>{s?.note || "Không có"}</b>
                  </div>
                  <div className="mst-sub">
                    Cuối tuần: <b>{isWeekend ? "Có" : "Không"}</b>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
