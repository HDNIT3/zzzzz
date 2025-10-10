import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { createPaymentRequest } from "../services/PaymentService";
import { getServiceOrderById } from "../services/ServiceOrderService";
import "../styles/booking-summary.css";

export default function BookingSummary({ showtimeId, selectedSeats, selectedServices: selectedServicesProp }) {
    const { user } = useAuth();
    const accountId = user?.accountId || null;
    const [selectedServices, setSelectedServices] = useState([]);
    const [serviceOrderId, setServiceOrderId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // ✅ Load services từ props hoặc localStorage
    useEffect(() => {
        const loadServiceOrder = async () => {
            // ✅ Nếu có services từ props, dùng luôn
            if (selectedServicesProp && selectedServicesProp.length > 0) {
                console.log("✅ Using services from props:", selectedServicesProp);
                setSelectedServices(selectedServicesProp);
                
                const orderId = localStorage.getItem("currentServiceOrderId");
                if (orderId) {
                    setServiceOrderId(orderId);
                }
                return;
            }

            // Fallback: Load từ localStorage nếu không có props
            const orderId = localStorage.getItem("currentServiceOrderId");
            
            if (!orderId) {
                console.log("⚠️ No service order found");
                return;
            }

            try {
                console.log("📦 Loading service order from API:", orderId);
                const orderData = await getServiceOrderById(orderId);
                console.log("✅ Service order data:", orderData);

                if (orderData.orderDetails && orderData.orderDetails.length > 0) {
                    const services = orderData.orderDetails.map(detail => ({
                        serviceId: detail.service.serviceId,
                        name: detail.service.name,
                        price: detail.price,
                        quantity: detail.quantity
                    }));
                    
                    setSelectedServices(services);
                    setServiceOrderId(orderId);
                    console.log("✅ Services loaded from API:", services);
                } else {
                    console.log("⚠️ No services in order");
                }
            } catch (error) {
                console.error("❌ Failed to load service order:", error);
            }
        };

        loadServiceOrder();
    }, [selectedServicesProp]);

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
            const pendingBill = {
                accountId,
                showtimeId,
                totalAmount: totalSeatPrice + totalServicePrice, 
                totalAmountVND: totalAmount,
                serviceOrderId: serviceOrderId || null,
                seatIds: selectedSeats.map((s) => s.id), 
                paymentMethod: "CREDIT",
                selectedSeats: selectedSeats.map(s => ({
                    id: s.id,
                    row: s.row,
                    col: s.col,
                    price: s.price,
                    type: s.type
                })),
                selectedServices: selectedServices.map(s => ({
                    serviceId: s.serviceId,
                    name: s.name,
                    price: s.price,
                    quantity: s.quantity
                }))
            };

            console.log("💾 Saving pending bill:", pendingBill);

            localStorage.setItem("pendingBill", JSON.stringify(pendingBill));
            
            localStorage.setItem("currentShowtimeId", showtimeId);
            localStorage.setItem("selectedSeatIds", JSON.stringify(selectedSeats.map(s => s.id)));
            localStorage.setItem("totalAmount", (totalSeatPrice + totalServicePrice).toString());
            localStorage.setItem("paymentMethod", "CARD");
            
            if (serviceOrderId) {
                localStorage.setItem("currentServiceOrderId", serviceOrderId);
            }

            const data = await createPaymentRequest(totalAmount, `Booking-${accountId}-${Date.now()}`);

            if (data.success && data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                setMessage("❌ Lỗi khi tạo yêu cầu thanh toán VNPay.");
                localStorage.removeItem("pendingBill");
            }
        } catch (err) {
            console.error("❌ Payment error:", err);
            setMessage("❌ Lỗi kết nối máy chủ!");
            localStorage.removeItem("pendingBill");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get("vnp_ResponseCode");

        if (paymentStatus === "24") { // User cancelled
            const pendingBill = localStorage.getItem("pendingBill");
            if (pendingBill) {
                localStorage.removeItem("pendingBill");
            }
            console.log("⚠️ Payment cancelled by user");
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
                                        <th>Giá $</th>
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
                                        <th>Giá $</th>
                                        <th>Tổng $</th>
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
                        <h5 className="text-end fw-bold text-primary">💵 Tổng $: {(totalSeatPrice + totalServicePrice).toLocaleString()} $</h5>
                        <h5 className="text-end fw-bold text-success">💰 Tổng VND: {totalAmount.toLocaleString()} VND</h5>
                    </div>

                    {/* Nút thanh toán */}
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-success btn-lg px-5 py-3"
                            onClick={handlePay}
                            disabled={loading || selectedSeats.length === 0}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                "💳 Thanh toán VNPay"
                            )}
                        </button>
                        {message && (
                            <div className={`mt-3 alert ${message.includes("❌") ? "alert-danger" : "alert-info"} text-center`}>
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="text-center mt-3">
                        <small className="text-muted">
                            <i className="bi bi-shield-check"></i> Thanh toán an toàn với VNPay
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}