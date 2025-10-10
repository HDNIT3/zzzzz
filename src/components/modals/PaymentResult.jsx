import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../../services/BookingService";
import { createBill } from "../../services/BillService";
import { CheckCircle, XCircle, Loader, AlertCircle } from "lucide-react";
import "../../styles/payment-result.css";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  
  // ✅ Lấy các tham số từ URL (do VNPay callback redirect)
  const successParam = params.get("success");
  const vnpResponseCode = params.get("vnp_ResponseCode");
  const vnpMessage = params.get("vnp_Message") || params.get("message");
  const vnpTxnRef = params.get("vnp_TxnRef");
  const vnpAmount = params.get("vnp_Amount");
  const vnpBankCode = params.get("vnp_BankCode");
  const vnpTransactionNo = params.get("vnp_TransactionNo");
  
  // ✅ Kiểm tra success từ nhiều nguồn
  const success = successParam === "true" || vnpResponseCode === "00";
  
  const called = useRef(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const handleCreateBookingAndBill = async () => {
      // Prevent double execution
      if (called.current) return;
      called.current = true;

      // Nếu thanh toán thất bại hoặc bị hủy
      if (!success) { 
        // Xóa pendingBill
        localStorage.removeItem("pendingBill");
        
        // Set error message dựa vào response code
        const errorMessages = {
          "24": "Bạn đã hủy thanh toán",
          "07": "Giao dịch bị nghi ngờ gian lận",
          "09": "Thẻ chưa đăng ký dịch vụ Internet Banking",
          "10": "Xác thực thông tin thẻ không đúng",
          "11": "Hết hạn chờ thanh toán",
          "12": "Thẻ bị khóa",
          "13": "Sai mật khẩu xác thực giao dịch",
          "51": "Tài khoản không đủ số dư",
          "65": "Tài khoản đã vượt quá giới hạn giao dịch trong ngày",
          "75": "Ngân hàng đang bảo trì",
          "79": "Giao dịch vượt quá số lần nhập sai mật khẩu"
        };
        
        setError(
          errorMessages[vnpResponseCode] || 
          vnpMessage || 
          "Thanh toán không thành công"
        );
        return;
      }

      try {
        setProcessing(true);
        
        // Lấy thông tin từ pendingBill đã lưu trước khi thanh toán
        const pendingBillStr = localStorage.getItem("pendingBill");
        
        if (!pendingBillStr) {
          throw new Error("Không tìm thấy thông tin đặt vé. Vui lòng đặt lại.");
        }

        const pendingBill = JSON.parse(pendingBillStr);

        // Validate required data
        if (!pendingBill.accountId || !pendingBill.showtimeId || !pendingBill.seatIds?.length) {
          throw new Error("Thiếu thông tin đặt vé. Vui lòng thử lại.");
        }

        // Step 1: Create booking
        const bookingResponse = await createBooking(
          pendingBill.showtimeId,
          pendingBill.accountId,
          pendingBill.seatIds,
          pendingBill.serviceOrderId
        );

        // ✅ Extract bookingId - handle nested response
        let bookingId = bookingResponse?.bookingId || bookingResponse?.data?.bookingId;
        let totalAmount = bookingResponse?.totalAmount || bookingResponse?.data?.totalAmount;
      

        // ✅ Validate bookingId
        if (!bookingId) {
          console.error("❌ No booking ID found in response:", bookingResponse);
          throw new Error("Không thể tạo booking. Vui lòng thử lại.");
        }

        // Step 2: Create bill
        const billPayload = {
          bookingId: bookingId, // ✅ Ensure bookingId is not undefined
          paymentMethod: pendingBill.paymentMethod || "CREDIT",
          totalAmount: pendingBill.totalAmount, // Tổng $ từ pendingBill
          serviceOrderId: pendingBill.serviceOrderId || null
        };

        const billResponse = await createBill(billPayload);
        
        // ✅ Extract billId - handle nested response
        let billId = billResponse?.billId || billResponse?.data?.billId;

        // Save booking data for display
        setBookingData({
          bookingId: bookingId,
          billId: billId,
          totalAmount: pendingBill.totalAmountVND, // Hiển thị VND
          totalAmountUSD: pendingBill.totalAmount, // Hiển thị $
          transactionRef: vnpTxnRef || vnpTransactionNo,
          bankCode: vnpBankCode,
          seats: pendingBill.selectedSeats,
          services: pendingBill.selectedServices
        });

        // ✅ Clear all localStorage data
        localStorage.removeItem("pendingBill");
        localStorage.removeItem("currentShowtimeId");
        localStorage.removeItem("selectedSeatIds");
        localStorage.removeItem("currentServiceOrderId");
        localStorage.removeItem("totalAmount");
        localStorage.removeItem("paymentMethod");

        setProcessing(false);

      } catch (err) {
        console.error("❌ Error creating booking/bill:", err);
        console.error("❌ Error details:", err.response?.data);
        
        setError(
          err.response?.data?.error || 
          err.response?.data?.message || 
          err.message || 
          "Không thể hoàn tất đặt vé"
        );
        setProcessing(false);
        
        // Không xóa pendingBill nếu lỗi, để user có thể thử lại
      }
    };

    handleCreateBookingAndBill();
  }, [success, vnpResponseCode, vnpTxnRef, vnpTransactionNo, vnpBankCode, successParam, vnpMessage]);

  // Redirect after 7 seconds on success
  useEffect(() => {
    if (bookingData && !processing) {
      const timer = setTimeout(() => {
        navigate("/mov-bk");
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [bookingData, processing, navigate]);

  // ⏳ Processing state
  if (processing) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-CREDIT payment-result-processing">
          <Loader className="payment-result-icon payment-result-icon-spin" size={64} />
          <h2>Đang xử lý đặt vé...</h2>
          <p>Vui lòng đợi trong giây lát, chúng tôi đang xác nhận booking và tạo hóa đơn cho bạn.</p>
          <div className="payment-result-progress-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  // ❌ Failed/Cancelled payment
  if (!success || error) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-CREDIT payment-result-error">
          {vnpResponseCode === "24" || successParam === "false" ? (
            <AlertCircle className="payment-result-icon" size={64} />
          ) : (
            <XCircle className="payment-result-icon" size={64} />
          )}
          <h2>
            {vnpResponseCode === "24" || successParam === "false" 
              ? "Thanh toán đã bị hủy" 
              : "Thanh toán thất bại"}
          </h2>
          <p>{error || "Giao dịch không thành công. Vui lòng thử lại."}</p>
          
          {(vnpTxnRef || vnpTransactionNo) && (
            <div className="payment-result-transaction-info">
              <small>Mã giao dịch: {vnpTxnRef || vnpTransactionNo}</small>
              {vnpBankCode && <small className="d-block mt-1">Ngân hàng: {vnpBankCode}</small>}
            </div>
          )}

          <div className="payment-result-button-group">
            <button onClick={() => navigate(-1)} className="payment-result-btn-secondary">
              Thử lại
            </button>
            <button onClick={() => navigate("/mov-bk")} className="payment-result-btn-primary">
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Success state
  if (bookingData) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-CREDIT payment-result-success">
          <CheckCircle className="payment-result-icon" size={64} />
          <h2>Thanh toán thành công!</h2>
          <p>Đặt vé của bạn đã được xác nhận.</p>
          
          <div className="payment-result-booking-details">
            <div className="payment-result-detail-row">
              <span className="payment-result-label">Mã đặt vé:</span>
              <span className="payment-result-value">{bookingData.bookingId}</span>
            </div>
            {bookingData.billId && (
              <div className="payment-result-detail-row">
                <span className="payment-result-label">Mã hóa đơn:</span>
                <span className="payment-result-value">{bookingData.billId}</span>
              </div>
            )}
            {bookingData.transactionRef && (
              <div className="payment-result-detail-row">
                <span className="payment-result-label">Mã giao dịch:</span>
                <span className="payment-result-value">{bookingData.transactionRef}</span>
              </div>
            )}
            {bookingData.bankCode && (
              <div className="payment-result-detail-row">
                <span className="payment-result-label">Ngân hàng:</span>
                <span className="payment-result-value">{bookingData.bankCode}</span>
              </div>
            )}
            <div className="payment-result-detail-row payment-result-highlight">
              <span className="payment-result-label">Tổng tiền:</span>
              <span className="payment-result-value">
                {bookingData.totalAmountUSD?.toLocaleString()} $ 
                <small> ({bookingData.totalAmount?.toLocaleString()} VND)</small>
              </span>
            </div>
          </div>

          {/* Ghế đã đặt */}
          {bookingData.seats && bookingData.seats.length > 0 && (
            <div className="payment-result-booked-items">
              <h4>💺 Ghế đã đặt:</h4>
              <div className="payment-result-seats-list">
                {bookingData.seats.map((seat, idx) => (
                  <span key={idx} className="payment-result-seat-badge">
                    {seat.row}{seat.col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dịch vụ đã đặt */}
          {bookingData.services && bookingData.services.length > 0 && (
            <div className="payment-result-booked-items">
              <h4>🍿 Dịch vụ đã đặt:</h4>
              <ul className="payment-result-services-list">
                {bookingData.services.map((service, idx) => (
                  <li key={idx}>
                    {service.name} × {service.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="payment-result-redirect-message">
            Tự động chuyển về trang chủ sau 7 giây...
          </p>
          
          <div className="payment-result-button-group">
            <button 
              onClick={() => navigate("/mov-bk")} 
              className="payment-result-btn-primary"
            >
              Về trang chủ
            </button>
            <button 
              onClick={() => {
                const accountId = localStorage.getItem("accountId") || sessionStorage.getItem("accountId");
                navigate(`/bills/${accountId}`);
              }} 
              className="payment-result-btn-secondary"
            >
              Xem hóa đơn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}