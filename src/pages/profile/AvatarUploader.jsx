// src/pages/profile/AvatarUploader.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadAvatar } from "../../services/profileApi";
import { AuthContext } from "../../context/AuthContext";

export default function AvatarUploader() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [msg, setMsg] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleSelect = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!["image/jpeg", "image/png", "image/gif"].includes(f.type)) {
            setMsg("❌ Chỉ chấp nhận ảnh JPG, PNG hoặc GIF");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setMsg("❌ Kích thước tối đa là 5MB");
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setMsg("");
    };

    const handleUpload = async () => {
        if (!file || !user?.accountId) return;
        try {
            setUploading(true);
            const result = await uploadAvatar(user.accountId, file);
            setMsg("✅ Cập nhật avatar thành công!");
            setTimeout(() => navigate("/prof", { state: { newAvatar: result.imageUrl } }), 900);
        } catch (err) {
            console.log("UPLOAD avatar error:", err?.response?.status, err?.response?.data || err);
            setMsg("❌ Lỗi upload. Kiểm tra BE hoặc Cloudinary.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto my-10 p-8 bg-gray-900 rounded-2xl text-white shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-orange-400 mb-6">
                TẢI ẢNH ĐẠI DIỆN MỚI
            </h2>

            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center">
                {preview ? (
                    <img
                        src={preview}
                        alt="preview"
                        className="w-36 h-36 object-cover rounded-full mx-auto mb-4 border-4 border-orange-400"
                    />
                ) : (
                    <div className="text-gray-400 mb-4">Chưa chọn ảnh</div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleSelect}
                    className="block mx-auto text-sm text-gray-300"
                />

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`mt-4 px-6 py-2 rounded-lg font-semibold transition ${uploading
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                >
                    {uploading ? "Đang tải..." : "Tải lên"}
                </button>

                {msg && <p className="mt-3 text-sm">{msg}</p>}
            </div>

            <button
                onClick={() => navigate("/prof")}
                className="block mx-auto mt-6 text-orange-400 hover:underline"
            >
                ← Quay lại trang hồ sơ
            </button>
        </div>
    );
}
