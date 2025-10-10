import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/ProfileService";
import "../styles/profile-me.css";

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
                const data = await getProfile(accountId);
                setProfile(data);
            } catch (err) {
                console.error("GET profile error:", err);
                setError("Không thể tải hồ sơ. Kiểm tra BE hoặc DB.");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [accountId]);

    if (!accountId) {
        return (
            <div className="profile-me-container">
                <div className="profile-me-card">
                    <p className="profile-me-text">Chưa đăng nhập.</p>
                    <button className="profile-me-btn profile-me-btn-primary" onClick={openLoginModal}>
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="profile-me-container">
                <div className="profile-me-card">
                    <div className="profile-me-placeholder">
                        <span className="profile-me-placeholder-line profile-me-placeholder-line-long"></span>
                        <span className="profile-me-placeholder-line profile-me-placeholder-line-short"></span>
                    </div>
                    <div className="profile-me-loading-text">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-me-container">
                <div className="profile-me-card">
                    <div className="profile-me-error">{error}</div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-me-container">
                <div className="profile-me-card">
                    <div className="profile-me-text">Không tìm thấy dữ liệu hồ sơ.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-me-container">
            {/* Header */}
            <div className="profile-me-header">
                <h2 className="profile-me-title">Hồ sơ cá nhân</h2>
                <button
                    onClick={() => navigate("/profile/avatar")}
                    className="profile-me-btn profile-me-btn-outline"
                >
                    Đổi avatar
                </button>
            </div>

            {/* Profile card */}
            <div className="profile-me-card profile-me-main-card">
                <div className="profile-me-content">
                    {/* Avatar */}
                    <div className="profile-me-avatar-wrapper">
                        <img
                            src={profile.avatarUrl || "https://via.placeholder.com/240x240?text=Avatar"}
                            alt="avatar"
                            className="profile-me-avatar"
                        />
                    </div>

                    {/* Info */}
                    <div className="profile-me-info">
                        <div className="profile-me-info-grid">
                            <div className="profile-me-field">
                                <div className="profile-me-label">Họ tên</div>
                                <div className="profile-me-value">{profile.fullName}</div>
                            </div>
                            <div className="profile-me-field">
                                <div className="profile-me-label">Vai trò</div>
                                <div className="profile-me-value">{profile.role}</div>
                            </div>
                            <div className="profile-me-field">
                                <div className="profile-me-label">Email</div>
                                <div className="profile-me-value">{profile.email || "Chưa cập nhật"}</div>
                            </div>
                            <div className="profile-me-field">
                                <div className="profile-me-label">Điện thoại</div>
                                <div className="profile-me-value">{profile.phone || "Chưa cập nhật"}</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/profile/edit-basic")}
                        className="profile-me-btn profile-me-btn-edit"
                    >
                        Chỉnh sửa thông tin
                    </button>

                    {/* Social Media */}
                    <div className="profile-me-social-section">
                        <h5 className="profile-me-social-title">Mạng xã hội</h5>
                        <div className="profile-me-social-links">
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
                                    className={`profile-me-social-btn ${!item.url ? 'profile-me-social-btn-disabled' : ''}`}
                                    style={{
                                        backgroundColor: item.url ? item.color : "#6c757d",
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
            <div className="profile-me-card">
                <div className="profile-me-favorites-header">
                    <h4 className="profile-me-favorites-title">Phim yêu thích</h4>
                </div>

                {!profile.favorites || profile.favorites.length === 0 ? (
                    <div className="profile-me-empty-favorites">
                        Chưa có phim yêu thích.
                    </div>
                ) : (
                    <div className="profile-me-favorites-grid">
                        {profile.favorites.map((f, idx) => (
                            <div className="profile-me-favorite-item" key={idx}>
                                <div className="profile-me-favorite-title">{f.title}</div>
                                <div className="profile-me-favorite-rating">
                                    ⭐ {f.rating ?? 0} — {f.reviewCount ?? 0} đánh giá
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}