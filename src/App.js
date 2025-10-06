import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { MovieBooking } from "./pages/Movie-Booking";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Booking } from "./pages/Booking";
import Service from "./pages/Admin/Service";
import { SelectShowtime } from "./pages/SelectShowtime";
import PaymentResult from "./components/modals/PaymentResult";
import BillList from "./pages/MyBooKing";

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mov-bk" element={<MovieBooking />} />
                <Route path="/booking/:movieId" element={<SelectShowtime />} />
                <Route path="/booking/:movieId/:showtimeId" element={<Booking />} />
                <Route path="/admin/service" element={<Service />} />
                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/bk-his" element={<BillList />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
