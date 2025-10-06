import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getBillsByAccount } from "../services/BillService";
import "../styles/bill-list.css";

export default function BillList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const accountId = user?.accountId || null;

  useEffect(() => {
    const fetchBills = async () => {
      if (!accountId) {
        setError("Please log in to view your bills");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getBillsByAccount(accountId);
        if (data.success) {
          setBills(data.bills || []);
        } else {
          setError(data.error || "Failed to fetch bills");
        }
      } catch (err) {
        setError("Unable to load bills: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [accountId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="bill-loading">Loading bills...</div>;
  if (error) return <div className="bill-error">Error: {error}</div>;

  return (
    <div className="bill-list">
      <h2 className="bill-title">My Bills</h2>
      {bills.length === 0 ? (
        <p className="bill-empty">No bills found</p>
      ) : (
        <div className="bills-container">
          {bills.map((bill) => (
            <div key={bill.billId} className="bill-item">
              <div className="bill-header">
                <div><strong>Bill ID:</strong> {bill.billId}</div>
                <div><strong>Booking ID:</strong> {bill.bookingId}</div>
                <div>{formatDate(bill.startTime)}</div>
              </div>
              <div className="bill-details">
                <p><strong>Movie:</strong> {bill.movieTitle}</p>
                <p><strong>Room:</strong> {bill.roomName}</p>
                <p><strong>Total Price:</strong> {formatCurrency(bill.totalPrice)}</p>

                {bill.seats?.length > 0 && (
                  <p><strong>Seats:</strong> {bill.seats.join(", ")}</p>
                )}

                {bill.services?.length > 0 && (
                  <div className="bill-services">
                    <strong>Services:</strong>
                    <ul>
                      {bill.services.map((s, idx) => (
                        <li key={idx}>{s.serviceName} x{s.quantity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
