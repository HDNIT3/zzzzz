import api from "./api";

export async function getSeatsByRoom(roomId) {
    const res = await api.get(`/api/seats/room/${roomId}`);
    return res.data;
}

export async function getSeatsByShowtime(showtimeId) {
    try {
        const res = await api.get(`/api/seats/showtime/${showtimeId}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching seats by showtime:", error);
        throw error;
    }
}

export async function updateSeatSelection(seatIds, action) {
    const res = await api.post("/api/seats/select", { seatIds, action });
    return res.data.seats; 
}

export async function createBooking(showtimeId, customerId, seatIds) {
    console.log("📤 Creating booking with:", { showtimeId, customerId, seatIds });
    
    const payload = {
        showtimeId,  
        customerId,   
        seatIds       
    };
    
    console.log("📦 Payload:", JSON.stringify(payload));
    
    const res = await api.post("/api/bookings", payload);
    return res.data;
}

export async function getShowtimeById(showtimeId) {
    const res = await api.get(`/api/showtimes/${showtimeId}`);
    return res.data;
}