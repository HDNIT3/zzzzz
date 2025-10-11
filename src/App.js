
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Service from "./pages/Admin/Service";
import PaymentResult from "./components/modals/PaymentResult";
import BillList from "./components/MyBooKing";
import UserReviews from "./pages/UserReviews";
import UploadAvatar from "./components/modals/profile/UploadAvatar";
import UpdateInfo from "./components/modals/profile/UpdateInfo";
import ProfileMe from "./pages/ProfileMe";
import { Booking } from "./pages/Booking";
import { SelectShowtime } from "./components/ShowtimeSelect";
import { MovieBooking } from "./pages/MovieBooking";
import Staff from "./pages/Staff";
import CustomerManager from "./pages/CustomerManagement";

export default function App() {
    return (
        <>
            <Header />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin/service" element={<Service />} />
                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/bk-his" element={<BillList />} />
                <Route path="/rev" element={<UserReviews />} />

                <Route path="/" element={<Home />} />

                <Route path="/mov-bk" element={<MovieBooking />} />
                <Route path="/booking/:movieId" element={<SelectShowtime />} />
                <Route path="/booking/:movieId/:showtimeId" element={<Booking />} />
                <Route path="/admin/service" element={<Service />} />
                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/bk-his" element={<BillList />} />
                <Route path="/rev" element={<UserReviews />} />

                <Route path="/prof" element={<ProfileMe />} />
                <Route path="/profile/avatar" element={<UploadAvatar />} />
                <Route path="/profile/edit-basic" element={<UpdateInfo />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/cus" element={<CustomerManager />} /> 

            </Routes>

            <Footer />
        </>
    );
}
