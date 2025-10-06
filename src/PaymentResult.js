import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    const message = params.get("message");

    // Biến cờ: chỉ gọi API 1 lần
    const called = useRef(false);

    useEffect(() => {
        if (success === "true" && !called.current) {
            called.current = true;

            const pendingBill = localStorage.getItem("pendingBill");
            if (pendingBill) {
                const billBody = JSON.parse(pendingBill);
                const urlParams = new URLSearchParams({
                    accountId: billBody.accountId,
                    showtimeId: billBody.showtimeId,
                    totalAmount: billBody.totalAmount,
                });
                const billRequest = {
                    details: billBody.details,
                    seatIds: billBody.seatIds,
                };

                fetch("http://localhost:8080/bills/create?" + urlParams.toString(), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(billRequest),
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            localStorage.removeItem("pendingBill");
                            alert("Tạo bill thành công!");
                            navigate("/user-bills");
                        } else {
                            alert("Tạo bill thất bại: " + data.error);
                        }
                    })
                    .catch(() => alert("Lỗi hệ thống khi tạo bill"));
            }
        }
    }, [success, navigate]);

    return (
        <div className="container my-4">
            <h2>Kết quả thanh toán</h2>
            <p>{message}</p>
        </div>
    );
}