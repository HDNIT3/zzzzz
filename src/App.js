// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Service from "./pages/Service";
import PaymentResult from "./components/modals/PaymentResult";
import BillList from "./components/MyBooKing";
import UserReviews from "./pages/UserReviews";
import ProfileViewer from "./pages/profile/me";
import AvatarUploader from "./pages/profile/AvatarUploader";

import { MovieBooking } from "./pages/Movie-Booking";
import { Booking } from "./pages/Booking";
import { SelectShowtime } from "./components/ShowtimeSelect";

import EditBasic from "./pages/profile/EditBasic";

export default function App() {
    return (
        <>
            {/* Header cố định ở mọi trang */}
            <Header />

            {/* Nội dung từng trang */}
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

                {/* Profile */}
                <Route path="/prof" element={<ProfileViewer />} />
                <Route path="/profile/avatar" element={<AvatarUploader />} />
                <Route path="/profile/edit-basic" element={<EditBasic />} />
            </Routes>

            {/* Footer cố định */}
            <Footer />
        </>
    );
}
