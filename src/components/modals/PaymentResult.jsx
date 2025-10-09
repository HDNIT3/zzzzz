import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../../services/BookingService";
import { createBill } from "../../services/BillService";

export default function PaymentResult({ bookingData }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const success = params.get("success");
  const message = params.get("message");
  const called = useRef(false);

  useEffect(() => {
  const handleCreateBookingAndBill = async () => {
    const pendingBill = localStorage.getItem("pendingBill");
    if (!pendingBill) return;

    const billBody = JSON.parse(pendingBill);
    console.log("📦 Pending bill:", billBody);

    try {
      let bookingId = billBody.bookingId;
      
      if (!bookingId) {
        const showtimeId = typeof billBody.showtimeId === 'object' 
          ? billBody.showtimeId.showtimeId
          : billBody.showtimeId;

        // ✅ FIX: Dùng accountId thay vì customerId
        const customerId = billBody.accountId || billBody.customerId;

        console.log("🎬 Showtime ID:", showtimeId);
        console.log("👤 Customer ID:", customerId);
        console.log("💺 Seat IDs:", billBody.seatIds);

        // Validate trước khi gửi
        if (!customerId) {
          throw new Error("Customer ID is missing! Please login again.");
        }
        if (!showtimeId) {
          throw new Error("Showtime ID is missing!");
        }
        if (!billBody.seatIds || billBody.seatIds.length === 0) {
          throw new Error("No seats selected!");
        }

        const bookingResp = await createBooking(
          showtimeId,
          customerId,
          billBody.seatIds
        );
        
        console.log("✅ Booking created:", bookingResp);
        bookingId = bookingResp.bookingId;
      }

      // 2️⃣ Tạo bill
      const bill = await createBill(bookingId, billBody.paymentMethod || "CREDIT");
      
      console.log("✅ Bill created:", bill);
      localStorage.removeItem("pendingBill");
      alert(`✅ Booking successful!\nBooking ID: ${bookingId}\nTotal: ${bill.totalAmount}đ`);
      navigate("/user-bills");
      
    } catch (error) {
      console.error("❌ Error:", error);
      
      // Show detailed error
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Unknown error occurred";
        
      alert(`❌ Booking failed!\n${errorMsg}`);
    }
  };

  if (success === "true" && !called.current) {
    called.current = true;
    handleCreateBookingAndBill();
  }
}, [success, navigate]);

  return (
    <div className="payment-result-container">
      <div className={`payment-card ${success === "true" ? "success" : "failed"}`}>
        <h2>{success === "true" ? "Payment Successful!" : "Payment Failed"}</h2>
        <p>{message}</p>
        <button className="btn-home" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
