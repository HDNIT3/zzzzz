import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { MovieBooking } from "./pages/Movie-Booking";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Booking } from "./pages/Booking"; // 1. Import component mới

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mov-bk" element={<MovieBooking />} />
                {/* 2. Thêm Route mới cho trang đặt vé */}
                {/* ":movieId" là một tham số động để biết đang đặt vé cho phim nào */}
                <Route path="/booking/:movieId" element={<Booking />} />
            </Routes>
            <Footer />
        </Router>
    )
}

export default App;