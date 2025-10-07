import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getSelectedServices } from "../utils/SelectedServiceStore";
import { createPaymentRequest } from "../services/PaymentService";
import "../styles/booking-summary.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BookingSummary({ showtimeId, selectedSeats }) {
    const { user } = useAuth();
    const accountId = user?.accountId || null;
    const selectedServices = getSelectedServices() || [];

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const totalSeatPrice = useMemo(
        () => selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0),
        [selectedSeats]
    );

    const totalServicePrice = useMemo(
        () => selectedServices.reduce((sum, s) => sum + (s.price * s.quantity || 0), 0),
        [selectedServices]
    );

    const totalAmount = (totalSeatPrice + totalServicePrice) * 23000;

    const handlePay = async () => {
        setLoading(true);
        setMessage("");

        try {
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

            const data = await createPaymentRequest(totalAmount, `Booking-${accountId}`);

            if (data.success && data.paymentUrl) {
                localStorage.setItem("pendingBill", JSON.stringify(billBody));
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

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get("vnp_ResponseCode");

        if (paymentStatus === "24") {
            const pendingBill = localStorage.getItem("pendingBill");
            if (pendingBill) localStorage.removeItem("pendingBill");
            window.history.back();
        }
    }, []);

    return (
        <div className="booking-summary-container">
            <div className="card shadow booking-summary-card">
                <div className="card-body">
                    <h2 className="text-center mb-4">🎟️ Booking Summary</h2>

                    {/* Ghế đã chọn */}
                    <section className="booking-section">
                        <h5 className="section-title">💺 Selected Seats</h5>
                        {selectedSeats.length === 0 ? (
                            <p className="text-muted">Chưa chọn ghế nào.</p>
                        ) : (
                            <table className="table table-striped table-bordered text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th>Mã ghế</th>
                                        <th>Loại</th>
                                        <th>Giá ₫</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSeats.map((s) => (
                                        <tr key={s.id}>
                                            <td>{s.row}{s.col}</td>
                                            <td>{s.type}</td>
                                            <td className="text-end">{s.price.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <p className="fw-bold text-end">Tổng ghế: {totalSeatPrice.toLocaleString()} $</p>
                    </section>

                    {/* Dịch vụ đã chọn */}
                    <section className="booking-section">
                        <h5 className="section-title">🍿 Selected Services</h5>
                        {selectedServices.length === 0 ? (
                            <p className="text-muted">Chưa chọn dịch vụ nào.</p>
                        ) : (
                            <table className="table table-striped table-bordered text-center">
                                <thead className="table-light">
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
                                            <td>{s.quantity}</td>
                                            <td className="text-end">{s.price.toLocaleString()}</td>
                                            <td className="text-end">{(s.price * s.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <p className="fw-bold text-end">Tổng dịch vụ: {totalServicePrice.toLocaleString()} $</p>
                    </section>

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
                        {message && <div className="mt-3 alert alert-info text-center">{message}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
