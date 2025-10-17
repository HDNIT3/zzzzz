import api from "./api";

export async function getSeatsByRoom(roomId) {
  try {
    const res = await api.get(`/api/seats/room/${roomId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching seats by room:", error);
    throw error;
  }
}

export async function updateSeatSelection(seatIds, status) {
  try {
    const res = await api.post("/api/seats/select", { seatIds, status });
    return res.data.seats;
  } catch (error) {
    console.error("❌ Error updating seat selection:", error);
    throw error;
  }
}
export async function createBooking(
  showtimeId,
  customerId = null,
  seatIds = [],
  serviceOrderId = null,
  isCounterBooking = false,
  cashierId = null,
  customerPhone = null
) {
  try {
    // Validate input
    if (!showtimeId) {
      throw new Error("showtimeId is required");
    }

    if (!seatIds || seatIds.length === 0) {
      throw new Error("seatIds cannot be empty");
    }

    // Chuẩn bị payload theo đúng backend API
    const payload = {
      showtimeId,
      seatIds,
      isCounterBooking: isCounterBooking || false
    };

    // Thêm serviceOrderId nếu có
    if (serviceOrderId) {
      payload.serviceOrderId = serviceOrderId;
    }

    // Nếu là đặt tại quầy (counter booking)
    if (isCounterBooking) {
      if (!cashierId) {
        throw new Error("cashierId is required for counter booking");
      }
      if (!customerPhone) {
        throw new Error("customerPhone is required for counter booking");
      }
      payload.cashierId = cashierId;
      payload.customerPhone = customerPhone;
    } else {
      // Nếu đặt online (customer booking)
      if (!customerId) {
        throw new Error("customerId is required for online booking");
      }
      payload.customerId = customerId; // Backend expects "customerId" (which is accountId)
    }

    console.log("📤 Creating booking with payload:", payload);

    // Gửi request
    const res = await api.post("/api/bookings", payload);
    
    console.log("✅ Booking created successfully:", res.data);
    
    // Return the booking data
    // Backend có thể trả về: { bookingId, totalAmount, ... } hoặc { data: { bookingId, ... } }
    return res.data;
    
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    console.error("❌ Error response:", error.response?.data);
    throw error;
  }
}

export async function getShowtimeById(showtimeId) {
  try {
    const res = await api.get(`/api/showtimes/${showtimeId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching showtime:", error);
    throw error;
  }
}

export async function getSeatsByShowtime(showtimeId) {
  try {
    const res = await api.get(`/api/showtimes/${showtimeId}/seats`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching seats by showtime:", error);
    throw error;
  }
}

export async function getBookingsByCustomer(customerId) {
  try {
    const res = await api.get(`/api/bookings/customer/${customerId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    throw error;
  }
}

export async function getBookingById(bookingId) {
  try {
    const res = await api.get(`/api/bookings/${bookingId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    throw error;
  }
}