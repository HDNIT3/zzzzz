// File: src/components/ProfileViewer.jsx

import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext"; // Đường dẫn đến AuthContext của bạn
import axios from "axios";

// ---------------------------------------------------------
// 1. HÀM GỌI API: KHÔNG CÓ TOKEN (CÔNG KHAI)
// ---------------------------------------------------------
/**
 * Gọi API /api/profile/me. KHÔNG bao gồm Authorization header.
 * @param {string | null} accountId ID tài khoản để truy vấn hồ sơ cụ thể.
 * @returns {Promise<object>} Dữ liệu hồ sơ.
 */
const getMyProfileRequest = async (accountId) => {
    // URL API Spring Boot của bạn
    const apiUrl = `http://localhost:8080/api/profile/me`;

    // Xây dựng tham số truy vấn: nếu có accountId, truyền nó vào.
    const params = accountId ? { accountId } : {};

    // Thực hiện GET request KHÔNG có Header Authorization
    const response = await axios.get(apiUrl, {
        params: params,
    });

    return response.data;
};


// ---------------------------------------------------------
// 2. COMPONENT REACT HIỂN THỊ HỒ SƠ
// ---------------------------------------------------------
function ProfileViewer() {
    // Lấy user (đã đăng nhập), hàm logout và openLoginModal từ AuthContext
    const { user, logout, openLoginModal } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy accountId từ user đã được giải mã JWT (nếu user có tồn tại)
    const accountId = user?.accountId;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Gọi API với accountId (hoặc undefined/null nếu chưa đăng nhập)
                const profileData = await getMyProfileRequest(accountId);
                setProfile(profileData);

            } catch (err) {
                console.error("Lỗi khi tải Profile:", err);
                // Hiển thị thông báo lỗi thân thiện hơn
                setError("Không thể tải thông tin hồ sơ. Đảm bảo API đã chạy.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

    }, [accountId]); // Dependency: Chạy lại khi trạng thái đăng nhập (accountId) thay đổi

    // ---------------------------------------------------------
    // 3. HIỂN THỊ TRẠNG THÁI
    // ---------------------------------------------------------

    if (loading) {
        return <div className="p-4 text-center text-indigo-600">Đang tải hồ sơ...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4 text-center border border-red-300 bg-red-50 rounded">Lỗi: {error}</div>;
    }

    if (!profile) {
        return (
            <div className="p-4 text-center">
                <p>Không tìm thấy dữ liệu hồ sơ.</p>
                {/* Hiển thị nút Đăng nhập nếu chưa có user */}
                {!user && (
                    <button
                        onClick={openLoginModal}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Đăng nhập
                    </button>
                )}
            </div>
        );
    }

    // ---------------------------------------------------------
    // 4. HIỂN THỊ PROFILE
    // ---------------------------------------------------------

    return (
        <div className="max-w-4xl mx-auto my-8 p-6 bg-white shadow-xl rounded-xl border border-gray-200">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-700 border-b-4 border-indigo-100 pb-3">Thông tin Hồ sơ</h2>

            <div className="flex items-center space-x-6 mb-8">
                <img
                    src={profile.avatarUrl || 'https://via.placeholder.com/150?text=No+Avatar'}
                    alt="Avatar"
                    className="w-28 h-28 object-cover rounded-full border-4 border-indigo-300 shadow-lg"
                />
                <div>
                    <p className="text-2xl font-bold text-gray-900">{profile.fullName}</p>
                    <p className="text-md text-gray-600 mt-1">Vai trò: <span className="font-semibold text-indigo-600">{profile.role}</span></p>
                    
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-700 bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> {profile.email || 'Chưa cập nhật'}</p>
                <p><strong>Điện thoại:</strong> {profile.phone || 'Chưa cập nhật'}</p>
                <p><strong>Facebook:</strong> {profile.facebookUrl ? <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a> : 'N/A'}</p>
                <p><strong>Instagram:</strong> {profile.instagramUrl ? <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a> : 'N/A'}</p>
            </div>

            {/* Hiển thị Favorites */}
            {profile.favorites && profile.favorites.length > 0 && (
                <>
                    <h3 className="text-xl font-bold mt-10 mb-4 text-indigo-600 border-t pt-4">Phim Yêu thích ({profile.favorites.length})</h3>
                    <ul className="space-y-3">
                        {profile.favorites.map((fav, index) => (
                            <li key={index} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
                                <span className="font-medium text-gray-800">{fav.title}</span>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${fav.rating >= 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    Rating: {fav.rating} <span className="text-yellow-500">⭐</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* Nút Logout chỉ hiển thị khi đã đăng nhập */}
            {user && (
                <button
                    onClick={logout}
                    className="mt-8 px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 shadow-lg"
                >
                    Đăng Xuất
                </button>
            )}

        </div>
    );
}

export default ProfileViewer;