import React, { useState } from "react";
import "../styles/Support.css";
import { sendForgotPasswordOtp, verifyOtpAndResetPassword } from "../services/AuthService";

export default function Support() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState(null);

    const handleSendOtp = async () => {
        try {
            const res = await sendForgotPasswordOtp(email, otp, newPassword);
            setMessage(res.message);
            setStep(2);
        } catch (err) {
            setMessage(err.response?.data?.message || "Lỗi gửi OTP!");
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await verifyOtpAndResetPassword(email, otp, newPassword);
            setMessage(res.message);
            setStep(3);
        } catch (err) {
            setMessage(err.response?.data?.message || "Lỗi xác minh OTP!");
        }
    };

    return (
        <div className="support-container">
            <h1>Trang Hỗ Trợ</h1>

            {activeSection === null ? (
                <div className="support-buttons">
                    <button onClick={() => setActiveSection(1)}>1️⃣ Quên mật khẩu</button>
                    <button onClick={() => setActiveSection(2)}>2️⃣ Hướng dẫn</button>
                    <button onClick={() => setActiveSection(3)}>3️⃣ Chat với người khác</button>
                    <button onClick={() => setActiveSection(4)}>4️⃣ Hỏi admin</button>
                </div>
            ) : (
                <>
                    <button
                        className="back-button"
                        onClick={() => {
                            setActiveSection(null);
                            setStep(1);
                            setMessage("");
                        }}
                    >
                        Quay lại
                    </button>

                    {activeSection === 1 && (
                        <section className="support-section section-forgot">
                            <h2>1️⃣ Quên mật khẩu</h2>
                            {step === 1 && (
                                <div className="forgot-step">
                                    <input
                                        type="email"
                                        placeholder="Nhập email của bạn"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <button onClick={handleSendOtp}>Gửi OTP</button>
                                </div>
                            )}
                            {step === 2 && (
                                <div className="verify-step">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Nhập mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button onClick={handleVerifyOtp}>Đặt lại mật khẩu</button>
                                </div>
                            )}
                            {step === 3 && (
                                <div className="success-step">
                                    <p>Mật khẩu đã được đặt lại thành công!</p>
                                </div>
                            )}
                            {message && <p className="message">{message}</p>}
                        </section>
                    )}

                    {activeSection === 2 && (
                        <section className="support-section section-guide">
                            <h2>2️⃣ Hướng dẫn</h2>
                            <p>
                                ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
                            </p>
                        </section>
                    )}

                    {activeSection === 3 && (
                        <section className="support-section section-chat">
                            <h2>3️⃣ Chat với người khác</h2>
                            <div className="chat-box">
                                <p><strong>Người A:</strong> Mình không nhận được OTP 😢</p>
                                <input type="text" placeholder="Nhập tin nhắn của bạn..." />
                                <button>Gửi</button>
                            </div>
                        </section>
                    )}

                    {activeSection === 4 && (
                        <section className="support-section section-ask-admin">
                            <h2>4️⃣ Hỏi admin</h2>
                            <textarea placeholder="Nhập câu hỏi của bạn cho admin..."></textarea>
                            <button>Gửi câu hỏi</button>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}