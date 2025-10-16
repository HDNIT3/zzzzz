import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { createPaymentRequest } from "../../../services/PaymentService";
import { getServiceOrderById } from "../../../services/ServiceOrderService";
import { createBooking } from "../../../services/BookingService";
import { createBill , AddBillEmployee} from "../../../services/BillService";
import PaymentMethodSelector from "./PaymentMethodSelector";
import "../../../styles/booking-summary.css";

export default function BookingSummary({ 
    showtimeId, 
    selectedSeats, 
    selectedServices: selectedServicesProp,
    isCounterBooking = false,
    cashierId = null,
    customerPhone = null
}) {
    const { user } = useAuth();
    const accountId = user?.accountId || null;
    const [selectedServices, setSelectedServices] = useState([]);
    const [serviceOrderId, setServiceOrderId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadServiceOrder = async () => {
            if (selectedServicesProp && selectedServicesProp.length > 0) {
                console.log("✅ Using services from props:", selectedServicesProp);
                setSelectedServices(selectedServicesProp);
                
                const orderId = localStorage.getItem("currentServiceOrderId");
                if (orderId) {
                    setServiceOrderId(orderId);
                }
                return;
            }

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

    const totalAmountUSD = totalSeatPrice + totalServicePrice;
    const totalAmountVND = totalAmountUSD * 23000;

    // Xử lý thanh toán cho đặt vé tại quầy
    const handleCounterPayment = async () => {
        setLoading(true);
        setMessage("");

        try {
            console.log("🏪 Processing counter booking...");

            // Bước 1: Tạo Booking
            const bookingResponse = await createBooking(
                showtimeId,
                null, // customerId = null for counter booking
                selectedSeats.map(s => s.id),
                serviceOrderId,
                true, // isCounterBooking = true
                cashierId,
                customerPhone
            );

            const bookingId = bookingResponse?.bookingId || bookingResponse?.data?.bookingId;

            if (!bookingId) {
                throw new Error("Failed to get booking ID from response");
            }

            console.log("✅ Booking created:", bookingId);

            // Bước 2: Tạo Bill với payment method đã chọn
            const billPayload = {
                bookingId: bookingId,
                paymentMethod: paymentMethod, // CASH, CREDIT, DEBIT, MOMO
                totalAmount: totalAmountUSD,
                serviceOrderId: serviceOrderId || null
            };

            console.log("💰 Creating bill with payload:", billPayload);

            const billResponse = await createBill(billPayload);
            const billId = billResponse?.billId || billResponse?.data?.billId;

            console.log("✅ Bill created:", billId);

        

            // Clear localStorage
            localStorage.removeItem("currentServiceOrderId");
            localStorage.removeItem("currentShowtimeId");
            localStorage.removeItem("selectedSeatIds");

            setMessage(`✅ Đặt vé thành công!\nBooking ID: ${bookingId}\nBill ID: ${billId}\nPhương thức: ${paymentMethod}`);

            if (user.role === 'STAFF') { 
                console.log("🧾 Associating bill with employee:", cashierId);
                console.log("🧾 Bill ID:", billId);
                await AddBillEmployee(billId, cashierId);
            }
            // Redirect sau 3 giây
            setTimeout(() => {
                window.location.href = "/counter-bookings";
            }, 3000);

        } catch (err) {
            console.error("❌ Counter booking error:", err);
            setMessage("❌ Lỗi: " + (err.response?.data?.message || err.message || "Không thể tạo booking"));
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thanh toán online (VNPay)
    const handleOnlinePayment = async () => {
        setLoading(true);
        setMessage("");

        try {
            const pendingBill = {
                accountId,
                showtimeId,
                totalAmount: totalAmountUSD, 
                totalAmountVND: totalAmountVND,
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
            localStorage.setItem("totalAmount", totalAmountUSD.toString());
            localStorage.setItem("paymentMethod", "CARD");
            
            if (serviceOrderId) {
                localStorage.setItem("currentServiceOrderId", serviceOrderId);
            }

            const data = await createPaymentRequest(totalAmountVND, `Booking-${accountId}-${Date.now()}`);

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

    const handlePay = isCounterBooking ? handleCounterPayment : handleOnlinePayment;

    return (
        <div className="booking-summary-container">
            <div className="card shadow booking-summary-card">
                <div className="card-body">
                    <h2 className="text-center mb-4">
                        {isCounterBooking ? "🏪 Counter Booking" : "🎟️ Online Booking"}
                    </h2>

                    {/* Thông tin khách hàng (cho counter booking) */}
                    {isCounterBooking && (
                        <div className="alert alert-info mb-3">
                            <strong>👤 Khách hàng:</strong> {customerPhone || "N/A"}<br/>
                            <strong>👨‍💼 Nhân viên:</strong> {cashierId || user?.username || "N/A"}
                        </div>
                    )}

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

                    {/* Phương thức thanh toán (chỉ cho counter booking) */}
                    {isCounterBooking && (
                        <section className="booking-section">
                            <PaymentMethodSelector 
                                onSelectPaymentMethod={setPaymentMethod}
                                disabled={loading}
                            />
                        </section>
                    )}

                    {/* Tổng cộng */}
                    <div className="border-top pt-3">
                        <h5 className="text-end fw-bold text-primary">
                            💵 Tổng $: {totalAmountUSD.toLocaleString()} $
                        </h5>
                        <h5 className="text-end fw-bold text-success">
                            💰 Tổng VND: {totalAmountVND.toLocaleString()} VND
                        </h5>
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
                            ) : isCounterBooking ? (
                                `💳 Xác nhận thanh toán ${paymentMethod}`
                            ) : (
                                "💳 Thanh toán VNPay"
                            )}
                        </button>
                        {message && (
                            <div className={`mt-3 alert ${message.includes("❌") ? "alert-danger" : "alert-success"} text-center`} style={{whiteSpace: 'pre-line'}}>
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="text-center mt-3">
                        <small className="text-muted">
                            <i className="bi bi-shield-check"></i> 
                            {isCounterBooking 
                                ? " Thanh toán trực tiếp tại quầy" 
                                : " Thanh toán an toàn với VNPay"}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}