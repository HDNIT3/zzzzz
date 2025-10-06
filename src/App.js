import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { MovieBooking } from "./pages/Movie-Booking";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Booking } from "./pages/Booking";
import Se from "./pages/Admin/Service";
import { SelectShowtime } from "./pages/SelectShowtime"; // ✅ import mới
import PaymentResult from "./PaymentResult";
import BillList from "./pages/MyBooKing";

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

                <Route path="/admin/service" element={<Se />} />

                <Route path="/payment-result" element={<PaymentResult />} />

                <Route path="/bk-his" element={<BillList/>} />
            </Routes>
            <Footer />
        </Router>
    )
}

export default App;
