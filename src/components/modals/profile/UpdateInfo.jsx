import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getProfile, updateBasic } from "../../../services/ProfileService";
import "../../../styles/upload-avatar.css";

export default function UpdateInfo() {
  const { user } = useContext(AuthContext);
  const accountId = user?.accountId;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedInUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!accountId) {
        setLoading(false);
        return;
      }
      try {
        const data = await getProfile(accountId);
        setForm({
          fullName: data.fullName || "",
          facebookUrl: data.facebookUrl || "",
          instagramUrl: data.instagramUrl || "",
          twitterUrl: data.twitterUrl || "",
          linkedInUrl: data.linkedInUrl || "",
        });
      } catch {
        setMsg("Không tải được dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [accountId]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) return;

    try {
      setLoading(true);
      await updateBasic(accountId, form);
      setMsg("✅ Đã lưu!");
      setTimeout(() => navigate("/prof"), 800);
    } catch {
      setMsg("❌ Lưu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!accountId) {
    return <div className="update-info-container">Chưa đăng nhập.</div>;
  }

  if (loading) {
    return <div className="update-info-container">Đang tải...</div>;
  }

  return (
    <div className="update-info-container">
      <div className="update-info-modal">
        <h2 className="update-info-title">Cập nhật thông tin cơ bản</h2>

        <form className="update-info-form" onSubmit={onSubmit}>
          <div className="update-info-group">
            <label className="update-info-label">Họ tên</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder="Nhập họ tên đầy đủ"
              className="update-info-input"
            />
          </div>

          <div className="update-info-social-grid">
            <div className="update-info-group">
              <label className="update-info-label">Facebook URL</label>
              <input
                type="url"
                name="facebookUrl"
                value={form.facebookUrl}
                onChange={onChange}
                placeholder="https://facebook.com/..."
                className="update-info-input"
              />
            </div>
            <div className="update-info-group">
              <label className="update-info-label">Instagram URL</label>
              <input
                type="url"
                name="instagramUrl"
                value={form.instagramUrl}
                onChange={onChange}
                placeholder="https://instagram.com/..."
                className="update-info-input"
              />
            </div>
            <div className="update-info-group">
              <label className="update-info-label">Twitter URL</label>
              <input
                type="url"
                name="twitterUrl"
                value={form.twitterUrl}
                onChange={onChange}
                placeholder="https://twitter.com/..."
                className="update-info-input"
              />
            </div>
            <div className="update-info-group">
              <label className="update-info-label">LinkedIn URL</label>
              <input
                type="url"
                name="linkedInUrl"
                value={form.linkedInUrl}
                onChange={onChange}
                placeholder="https://linkedin.com/in/..."
                className="update-info-input"
              />
            </div>
          </div>

          <div className="update-info-button-group">
            <button type="submit" className="update-info-btn-primary">
              Lưu thay đổi
            </button>
            <button
              type="button"
              onClick={() => navigate("/prof")}
              className="update-info-btn-secondary"
            >
              Hủy bỏ
            </button>
          </div>

          {msg && (
            <div
              className={`update-info-message ${
                msg.includes("✅")
                  ? "update-info-success"
                  : "update-info-error"
              }`}
            >
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
