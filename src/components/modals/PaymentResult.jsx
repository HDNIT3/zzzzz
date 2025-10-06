import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBill } from "../../services/BillService";
import "../../styles/payment-result.css";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const success = params.get("success");
  const message = params.get("message");

  const called = useRef(false);

  useEffect(() => {
    const handleCreateBill = async () => {
      const pendingBill = localStorage.getItem("pendingBill");
      if (!pendingBill) return;

      const billBody = JSON.parse(pendingBill);

      try {
        const data = await createBill(
          billBody.accountId,
          billBody.showtimeId,
          billBody.totalAmount,
          {
            details: billBody.details,
            seatIds: billBody.seatIds,
          }
        );

        if (data.success) {
          localStorage.removeItem("pendingBill");
          alert("Bill created successfully!");
          navigate("/user-bills");
        } else {
          alert("Bill creation failed: " + data.error);
        }
      } catch (error) {
        alert("Bill creation failed: " + error.message);
      }
    };

    if (success === "true" && !called.current) {
      called.current = true;
      handleCreateBill();
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
