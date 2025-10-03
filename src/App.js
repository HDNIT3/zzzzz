import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { MovieBooking } from "./pages/Movie-Booking";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Booking } from "./pages/Booking";
import { SelectShowtime } from "./pages/SelectShowtime"; // ✅ import mới

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mov-bk" element={<MovieBooking />} />
                {/* Bước 1: chọn suất chiếu */}
                <Route path="/booking/:movieId" element={<SelectShowtime />} />
                {/* Bước 2: chọn ghế và thanh toán */}
                <Route path="/booking/:movieId/:showtimeId" element={<Booking />} />
            </Routes>
            <Footer />
        </Router>
    )
}

export default App;
