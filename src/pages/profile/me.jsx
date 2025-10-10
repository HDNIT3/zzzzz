// File: src/pages/profile/me.jsx
// Goal: CHỈ CHỈNH GIAO DIỆN (không đổi logic, API, hook, route).
// - Đồng bộ style với header/footer/home: dark theme, card bo góc, spacing rõ ràng.
// - Giữ nguyên luồng: lấy accountId từ AuthContext, fetch /api/profile/me, nút "Đổi avatar" -> /profile/avatar.

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileMe() {
    const { user, openLoginModal } = useContext(AuthContext);
    const accountId = user?.accountId;
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const run = async () => {
            if (!accountId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await fetch(
                    `http://localhost:8080/api/profile/me?accountId=${accountId}`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.log("GET /api/profile/me error:", err);
                setError("Không thể tải hồ sơ. Kiểm tra BE hoặc DB.");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [accountId]);

    // ==== UI helpers (style-only) ====
    const cardStyle = {
        background: "rgba(20, 24, 37, 0.9)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        borderRadius: "16px",
    };

    const sectionTitleStyle = {
        color: "#fff",
        margin: 0,
        fontWeight: 800,
        letterSpacing: 0.2,
    };

    const subLabelStyle = { color: "rgba(255,255,255,0.65)" };

    // ==== States unchanged (just styled containers) ====
    if (!accountId) {
        return (
            <div className="container my-4">
                <div className="p-4" style={cardStyle}>
                    <p className="mb-3" style={{ color: "#fff" }}>
                        Chưa đăng nhập.
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={openLoginModal}>
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    if (loading)
        return (
            <div className="container my-4">
                <div className="p-4" style={cardStyle}>
                    <div className="placeholder-wave">
                        <span className="placeholder col-6"></span>
                        <span className="placeholder col-4 ms-2"></span>
                    </div>
                    <div className="mt-3 text-light">Đang tải...</div>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="container my-4">
                <div className="p-4" style={cardStyle}>
                    <div className="text-danger">{error}</div>
                </div>
            </div>
        );

    if (!profile) {
        return (
            <div className="container my-4">
                <div className="p-4" style={cardStyle}>
                    <div className="text-light">Không tìm thấy dữ liệu hồ sơ.</div>
                </div>
            </div>
        );
    }

    // ==== Main UI ====
    return (
        <div className="container my-4">
            {/* Header row: title + action */}
            <div
                className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2"
            >
                <h2 style={sectionTitleStyle}>Hồ sơ cá nhân</h2>
                <button
                    onClick={() => navigate("/profile/avatar")}
                    className="btn btn-outline-primary btn-sm"
                >
                    Đổi avatar
                </button>
            </div>

            {/* Profile card */}
            <div className="p-4 mb-4" style={cardStyle}>
                <div className="row g-4 align-items-start">
                    {/* Avatar */}
                    <div className="col-12 col-md-auto text-center">
                        <img
                            src={
                                profile.avatarUrl ||
                                "https://via.placeholder.com/240x240?text=Avatar"
                            }
                            alt="avatar"
                            style={{
                                width: 240,
                                height: 240,
                                objectFit: "cover",
                                borderRadius: 16,
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div className="col">
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <div className="text-uppercase small" style={subLabelStyle}>
                                    Họ tên
                                </div>
                                <div className="fw-semibold text-light">{profile.fullName}</div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="text-uppercase small" style={subLabelStyle}>
                                    Vai trò
                                </div>
                                <div className="fw-semibold text-light">{profile.role}</div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="text-uppercase small" style={subLabelStyle}>
                                    Email
                                </div>
                                <div className="text-light">
                                    {profile.email || "Chưa cập nhật"}
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="text-uppercase small" style={subLabelStyle}>
                                    Điện thoại
                                </div>
                                <div className="text-light">
                                    {profile.phone || "Chưa cập nhật"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mạng xã hội (read-only, màu xanh biển sáng, mở tab mới) */}
                    <div className="mt-4">
                        <h5 className="mb-3 text-white fw-semibold">Mạng xã hội</h5>
                        <div className="d-flex flex-wrap gap-3">
                            {[
                                { label: "Facebook", url: profile.facebookUrl, color: "#0d6efd" },
                                { label: "Instagram", url: profile.instagramUrl, color: "#0dcaf0" },
                                { label: "Twitter", url: profile.twitterUrl, color: "#00acee" },
                                { label: "LinkedIn", url: profile.linkedInUrl, color: "#0077b5" },
                            ].map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.url || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm fw-semibold text-white"
                                    style={{
                                        minWidth: "120px",
                                        backgroundColor: item.url ? item.color : "#6c757d",
                                        opacity: item.url ? 1 : 0.5,
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: item.url ? "pointer" : "not-allowed",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>



                </div>
            </div>

            {/* Favorites */}
            <div className="p-4" style={cardStyle}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="m-0 text-light">Phim yêu thích</h4>
                </div>

                {!profile.favorites || profile.favorites.length === 0 ? (
                    <div
                        className="p-3 rounded"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px dashed rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.7)",
                        }}
                    >
                        Chưa có phim yêu thích.
                    </div>
                ) : (
                    <div className="row g-3">
                        {profile.favorites.map((f, idx) => (
                            <div className="col-12 col-md-6 col-lg-4" key={idx}>
                                <div
                                    className="p-3 h-100 d-flex flex-column justify-content-between"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: 12,
                                    }}
                                >
                                    <div className="fw-semibold text-light mb-1">{f.title}</div>
                                    <div className="text-muted small">
                                        ⭐ {f.rating ?? 0} — {f.reviewCount ?? 0} đánh giá
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
