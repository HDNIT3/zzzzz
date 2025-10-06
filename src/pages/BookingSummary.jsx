import React, { useContext, useMemo, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { getSelectedServices } from "../SelectedServiceStore";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BookingSummary({ showtimeId, selectedSeats }) {
    const { user } = useContext(AuthContext);
    const accountId = user?.accountId || null;
    const selectedServices = getSelectedServices() || [];

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Tính tổng giá ghế
    const totalSeatPrice = useMemo(
        () => selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0),
        [selectedSeats]
    );

    // Tính tổng giá dịch vụ
    const totalServicePrice = useMemo(
        () => selectedServices.reduce((sum, s) => sum + (s.price * s.quantity || 0), 0),
        [selectedServices]
    );

    const totalAmount = (totalSeatPrice + totalServicePrice) * 23000;

    const handlePay = async () => {
        setLoading(true);
        setMessage("");

        try {
            // Chuẩn bị dữ liệu bill tạm
            const billBody = {
                accountId,
                showtimeId,
                totalAmount,
                details: selectedServices.map((s) => ({
                    serviceId: s.serviceId,
                    quantity: s.quantity,
                })),
                seatIds: selectedSeats.map((s) => s.id),
            };

            // Gửi yêu cầu tạo thanh toán VNPay
            const params = new URLSearchParams({
                amount: Math.round(totalAmount), // VNPay yêu cầu số nguyên
                orderInfo: `Booking-${accountId}`,
            });

            const res = await fetch(`http://localhost:8080/api/payment/createPay?${params}`, {
                method: "POST",
            });

            const data = await res.json();

            if (data.success && data.paymentUrl) {
                // Lưu bill tạm để callback sử dụng
                localStorage.setItem("pendingBill", JSON.stringify(billBody));

                // Chuyển người dùng đến trang VNPay
                window.location.href = data.paymentUrl;
            } else {
                setMessage("❌ Lỗi khi tạo yêu cầu thanh toán VNPay.");
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Lỗi kết nối máy chủ!");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi người dùng hủy thanh toán
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get("vnp_ResponseCode"); // VNPay trả về query param

        if (paymentStatus === "24") { // 24 = hủy thanh toán
            const pendingBill = localStorage.getItem("pendingBill");
            if (pendingBill) {
                localStorage.removeItem("pendingBill"); // Xóa bill tạm
            }
            // Quay về trang trước
            window.history.back();
        }
    }, []);

    return (
        <div className="container my-4">
            <div className="card shadow">
                <div className="card-body">
                    <h2 className="text-center mb-4">🎟️ Booking Summary</h2>

                    {/* Ghế đã chọn */}
                    <div className="mb-4">
                        <h5 className="border-bottom pb-2">💺 Selected Seats</h5>
                        {selectedSeats.length === 0 ? (
                            <p className="text-muted">Chưa chọn ghế nào.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered align-middle">
                                    <thead className="table-light text-center">
                                        <tr>
                                            <th>Mã ghế</th>
                                            <th>Loại</th>
                                            <th>Giá ₫</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedSeats.map((s) => (
                                            <tr key={s.id}>
                                                <td className="text-center">{s.row}{s.col}</td>
                                                <td className="text-center">{s.type}</td>
                                                <td className="text-end">{s.price.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <p className="fw-bold text-end">Tổng ghế: {totalSeatPrice.toLocaleString()} $</p>
                    </div>

                    {/* Dịch vụ đã chọn */}
                    <div className="mb-4">
                        <h5 className="border-bottom pb-2">🍿 Selected Services</h5>
                        {selectedServices.length === 0 ? (
                            <p className="text-muted">Chưa chọn dịch vụ nào.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered align-middle">
                                    <thead className="table-light text-center">
                                        <tr>
                                            <th>Tên dịch vụ</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                            <th>Tổng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedServices.map((s, i) => (
                                            <tr key={i}>
                                                <td>{s.name}</td>
                                                <td className="text-center">{s.quantity}</td>
                                                <td className="text-end">{s.price.toLocaleString()}</td>
                                                <td className="text-end">{(s.price * s.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <p className="fw-bold text-end">Tổng dịch vụ: {totalServicePrice.toLocaleString()} $</p>
                    </div>

                    {/* Tổng cộng */}
                    <div className="border-top pt-3">
                        <h5 className="text-end fw-bold">💰 Tổng cộng: {totalAmount.toLocaleString()} VND</h5>
                    </div>

                    {/* Nút thanh toán */}
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-success px-5"
                            onClick={handlePay}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "💳 Thanh toán VNPay"}
                        </button>
                        {message && (
                            <div className="mt-3 alert alert-info text-center">
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}