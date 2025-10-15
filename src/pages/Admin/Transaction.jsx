import React, { useState, useEffect } from "react";
import { searchBillsByCustomerInfo } from "../../services/TransactionService";
import { useAuth } from "../../hooks/useAuth";
import * as XLSX from "xlsx-js-style";
import "../../styles/Transaction.css";

export default function Transaction() {
    const { user } = useAuth();
    const role = user ? user.role : "Chưa Login";

    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [loading, setLoading] = useState(false);

    // Bộ lọc
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    // Phân trang
    const [page, setPage] = useState(0);
    const [size] = useState(4);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const handleExportExcel = () => {
        if (!bills || bills.length === 0) return;

        // Lọc theo tháng/năm như giao diện đang hiển thị
        const filteredData = bills.filter(bill => {
            if (!bill.endTime) return false;
            const date = new Date(bill.endTime);
            const billMonth = date.getMonth() + 1;
            const billYear = date.getFullYear();
            const matchMonth = month ? billMonth === Number(month) : true;
            const matchYear = year ? billYear === Number(year) : true;
            return matchMonth && matchYear;
        });

        if (filteredData.length === 0) {
            alert("Không có dữ liệu để xuất Excel!");
            return;
        }

        const data = filteredData.map(bill => ({
            "Bill ID": bill.billId,
            "Payment": bill.paymentMethod,
            "Total ($)": bill.totalAmount,
            "Movie": bill.movieTitle,
            "Room": bill.theaterName,
            "Customer": bill.customerFullName,
            "Email": bill.customerEmail,
            "Phone": bill.customerPhoneNumber,
            "StartTime": bill.startTime,
            "EndTime": bill.endTime,
            "Seats": bill.bookedSeats.map(s => s.position).join(", "),
            "Services": bill.serviceDetails.map(s => `${s.serviceName} (x${s.quantity})`).join(", ")
        }));

        // 👉 Thêm dòng tổng cuối cùng
        const monthlyTotal = filteredData.reduce((sum, b) => sum + b.totalAmount, 0);
        data.push({
            "Bill ID": "",
            "Payment": "",
            "Total ($)": monthlyTotal,
            "Movie": "",
            "Room": "",
            "Customer": "",
            "Email": "",
            "Phone": "",
            "StartTime": "",
            "EndTime": "",
            "Seats": "",
            "Services": ""
        });

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Tự động giãn cột
        const colWidths = [];
        data.forEach(obj => {
            Object.keys(obj).forEach((key, i) => {
                const value = obj[key] ? obj[key].toString() : "";
                colWidths[i] = Math.max(colWidths[i] || key.length, value.length);
            });
        });
        worksheet["!cols"] = colWidths.map(w => ({ wch: w + 2 }));

        // 🌈 Tạo style
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { patternType: "solid", fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
            },
        };

        const normalStyle = {
            border: {
                top: { style: "thin", color: { rgb: "AAAAAA" } },
                left: { style: "thin", color: { rgb: "AAAAAA" } },
                bottom: { style: "thin", color: { rgb: "AAAAAA" } },
                right: { style: "thin", color: { rgb: "AAAAAA" } },
            },
        };

        const totalStyle = {
            font: { bold: true, color: { rgb: "000000" } },
            fill: { patternType: "solid", fgColor: { rgb: "FFD966" } }, // vàng nhạt
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
            },
        };

        // 🔧 Áp dụng style
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellRef]) continue;

                // Hàng đầu tiên là header
                if (R === 0) worksheet[cellRef].s = headerStyle;
                // Hàng cuối cùng là dòng tổng
                else if (R === range.e.r) worksheet[cellRef].s = totalStyle;
                else worksheet[cellRef].s = normalStyle;
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");
        XLSX.writeFile(workbook, "bills.xlsx");
    };

    useEffect(() => {
        if (role === "ADMIN" || role === "MANAGER") {
            fetchBills();
        }
    }, [role, page]);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const data = await searchBillsByCustomerInfo(email, phone, page, size);
            setBills(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error("Error fetching bills:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchBills();
    };

    const handlePrevPage = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    if (role !== "ADMIN" && role !== "MANAGER") {
        return <div>404 Page</div>;
    }

    // --- 🔍 Lọc hóa đơn theo tháng/năm (client-side) ---
    const filteredBills = bills.filter(bill => {
        if (!bill.endTime) return false;
        const date = new Date(bill.endTime);
        const billMonth = date.getMonth() + 1;
        const billYear = date.getFullYear();

        const matchMonth = month ? billMonth === Number(month) : true;
        const matchYear = year ? billYear === Number(year) : true;

        return matchMonth && matchYear;
    });

    // --- 💰 Tính tổng tiền của các hóa đơn sau khi lọc ---
    const monthlyTotal = filteredBills.reduce((sum, b) => sum + b.totalAmount, 0);

    return (
        <div className="transaction-container">
            <h1 className="transaction-title">Transaction Page</h1>

            {/* Export Button */}
            <button className="filter-input" onClick={handleExportExcel} style={{ marginBottom: 16 }}>
                Xuất Excel
            </button>

            {/* Bộ lọc tìm kiếm */}
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Nhập email khách hàng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="filter-input"
                />
                <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="filter-input"
                >
                    <option value="">-- Chọn tháng --</option>
                    {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Tháng {i + 1}
                        </option>
                    ))}
                </select>

                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="filter-input"
                >
                    <option value="">-- Chọn năm --</option>
                    {[2023, 2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>
                <button className="btn-search" onClick={handleSearch}>
                    Tìm kiếm
                </button>
            </div>

            {/* Nội dung chính */}
            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : !selectedBill ? (
                <>
                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th>Bill ID</th>
                                <th>Payment</th>
                                <th>Total ($)</th>
                                <th>Movie</th>
                                <th>Room</th>
                                <th>Customer</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan="7">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                <>
                                    {filteredBills.map((bill) => (
                                        <tr key={bill.billId}>
                                            <td>{bill.billId}</td>
                                            <td>{bill.paymentMethod}</td>
                                            <td>{bill.totalAmount}</td>
                                            <td>{bill.movieTitle}</td>
                                            <td>{bill.theaterName}</td>
                                            <td>{bill.customerFullName}</td>
                                            <td>
                                                <button
                                                    className="btn-view"
                                                    onClick={() => setSelectedBill(bill)}
                                                >
                                                    Xem
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bill-total-row">
                                        <td colSpan="2"></td>
                                        <td><strong>Tổng tháng: ${monthlyTotal}</strong></td>
                                        <td colSpan="4"></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>

                    {/* Phân trang */}
                    <div className="pagination">
                        <button
                            onClick={handlePrevPage}
                            disabled={page === 0}
                            className="btn-page"
                        >
                            ◀ Trước
                        </button>
                        <span>
                            Trang {page + 1}/{totalPages} ({totalElements} kết quả)
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={page === totalPages - 1 || totalPages === 0}
                            className="btn-page"
                        >
                            Sau ▶
                        </button>
                    </div>
                </>
            ) : (
                <div className="bill-detail">
                    <h2>Chi tiết Bill</h2>
                    <p><strong>Bill ID:</strong> {selectedBill.billId}</p>
                    <p><strong>Customer:</strong> {selectedBill.customerFullName}</p>
                    <p><strong>Email:</strong> {selectedBill.customerEmail}</p>
                    <p><strong>Phone:</strong> {selectedBill.customerPhoneNumber}</p>
                    <p>
                        <strong>StartTime:</strong>{" "}
                        {selectedBill.startTime && (
                            <>
                                Ngày {selectedBill.startTime.split("T")[0]} Giờ {selectedBill.startTime.split("T")[1]}
                            </>
                        )}
                    </p>
                    <p>
                        <strong>EndTime:</strong>{" "}
                        {selectedBill.endTime && (
                            <>
                                Ngày {selectedBill.endTime.split("T")[0]} Giờ {selectedBill.endTime.split("T")[1]}
                            </>
                        )}
                    </p>
                    <p><strong>Movie:</strong> {selectedBill.movieTitle}</p>
                    <p><strong>Theater:</strong> {selectedBill.theaterName}</p>
                    <p><strong>Total:</strong> ${selectedBill.totalAmount}</p>

                    <h3>Ghế đã đặt</h3>
                    <ul>
                        {selectedBill.bookedSeats.map((s) => (
                            <li key={s.seatId}>
                                {s.position} - {s.seatType} (${s.price})
                            </li>
                        ))}
                    </ul>

                    {selectedBill.serviceDetails.length > 0 && (
                        <>
                            <h3>Dịch vụ</h3>
                            <ul>
                                {selectedBill.serviceDetails.map((s) => (
                                    <li key={s.serviceId}>
                                        {s.serviceName} - SL: {s.quantity}, Giá: ${s.unitPrice} → Tổng: ${s.totalPrice}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <button className="btn-back" onClick={() => setSelectedBill(null)}>
                        ⬅ Quay lại
                    </button>
                </div>
            )}
        </div>
    );
}
