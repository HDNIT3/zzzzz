import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getBillsByAccount } from "../services/BillService";
import "../styles/my-booking.css";

export default function MyBooking() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
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
      
        
        if (Array.isArray(data)) {
          const sortedBills = data.sort((a, b) => 
            new Date(b.startTime) - new Date(a.startTime)
          );
          setBills(sortedBills);
        } else if (data?.error) {
          setError(data.error);
        } else {
          console.warn("⚠️ Unexpected data format:", data);
          setBills([]);
        }
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setError(err.message || "Unable to load bills. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [accountId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      CREDIT: "Credit Card",
      DEBIT: "Debit Card",
      CASH: "Cash",
      WALLET: "E-Wallet",
      MOMO: "MoMo",
      ZALOPAY: "ZaloPay",
    };
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <div className="bill-list">
        <div className="bill-loading">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bill-list">
        <div className="bill-error">
          <h3>⚠️ Error Loading Bills</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (bills.length === 0) {
    return (
      <div className="bill-list">
        <h2 className="bill-title">My Bookings</h2>
        <div className="bill-empty">
          <div className="empty-icon">🎬</div>
          <h3>No bookings yet</h3>
          <p>Book your first movie to see your history here!</p>
        </div>
      </div>
    );
  }

  // Bills display
  return (
    <div className="bill-list">
      <div className="bill-header-section">
        <h2 className="bill-title">My Bookings</h2>
        <p className="bill-subtitle">Total bookings: {bills.length}</p>
      </div>

      <div className="bills-container">
        {bills.map((bill) => (
          <div key={bill.billId} className="bill-item">
            <div className="bill-header">
              <div className="bill-header-left">
                <div className="bill-movie-title">{bill.movieTitle}</div>
                <div className="bill-date">{formatDate(bill.startTime)}</div>
              </div>
              <div className="bill-header-right">
                <div className="bill-amount">{formatCurrency(bill.totalAmount)}</div>
                <div className="bill-payment-badge">{getPaymentMethodDisplay(bill.paymentMethod)}</div>
              </div>
            </div>

            <div className="bill-details">
              <div className="bill-info-row">
                <span className="label">Customer:</span>
                <span className="value">{bill.customerName}</span>
              </div>

              <div className="bill-info-row">
                <span className="label">Room:</span>
                <span className="value">{bill.roomName}</span>
              </div>

              <div className="bill-info-row">
                <span className="label">Showtime:</span>
                <span className="value">
                  {formatTime(bill.startTime)} - {formatTime(bill.endTime)}
                </span>
              </div>

              {bill.seats?.length > 0 && (
                <div className="bill-info-row">
                  <span className="label">Seats:</span>
                  <span className="value seats-list">
                    {bill.seats.map((seat, idx) => (
                      <span key={idx} className="seat-badge">{seat}</span>
                    ))}
                  </span>
                </div>
              )}

              {bill.orderDetails?.length > 0 && (
                <div className="bill-services">
                  <div className="services-header">
                    <strong>🍿 Services Ordered</strong>
                  </div>
                  <ul className="services-list">
                    {bill.orderDetails.map((detail) => (
                      <li key={detail.id} className="service-item">
                        <span className="service-name">
                          {detail.serviceName} <span className="service-qty">× {detail.quantity}</span>
                        </span>
                        <span className="service-price">{formatCurrency(detail.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bill-footer">
                <div className="bill-ids">
                  <small>Bill ID: {bill.billId}</small>
                            &nbsp; | &nbsp;
                  <small>Booking ID: {bill.bookingId}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}