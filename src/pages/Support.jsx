import React, { useState, useEffect, useRef } from "react";
import "../styles/Support.css";
import {
    sendForgotPasswordOtp,
    verifyOtpAndResetPassword,
} from "../services/AuthService";
import { getMessages, receiveMessage } from "../services/SupportService";
import { useAuth } from "../hooks/useAuth";

export default function Support() {
    const { user } = useAuth();
    const namechat = user ? user.username : "Chưa login";
    const rolechat = user ? user.role : "Guest";

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState(null);

    // phần chat
    const [chatInput, setChatInput] = useState("");
    const [messagesList, setMessagesList] = useState([]);
    const chatBoxRef = useRef(null);

    // tải tin nhắn định kỳ
    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 1000);
        return () => clearInterval(interval);
    }, []);

    // tự cuộn xuống cuối mỗi khi có tin nhắn mới
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messagesList]);

    const loadMessages = async () => {
        try {
            const res = await getMessages();
            setMessagesList(res);
        } catch (err) {
            console.error("Lỗi load tin nhắn:", err);
        }
    };

    const handleSendOtp = async () => {
        try {
            const res = await sendForgotPasswordOtp(email);
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

    const handleSendChat = async (chatType) => {
        if (!chatInput.trim()) return;

        const roleSend = rolechat; // CUSTOMER hoặc ADMIN
        const role = chatType === 3 ? "CUSTOMER" : "ADMIN"; // nơi nhận

        try {
            await receiveMessage(namechat, chatInput, roleSend, role);
            setChatInput("");
            await loadMessages();
        } catch (err) {
            console.error("Lỗi gửi chat:", err);
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

                    {/* Quên mật khẩu */}
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

                    {/* Hướng dẫn */}
                    {activeSection === 2 && (
                        <section className="support-section section-guide">
                            <h2>2️⃣ Hướng dẫn</h2>
                            <p>Đang làm</p>
                        </section>
                    )}

                    {/* Chat với người khác */}
                    {activeSection === 3 && (
                        <section className="support-section section-chat">
                            <h2>3️⃣ Chat với người khác</h2>
                            <div className="chat-box" ref={chatBoxRef}>
                                {messagesList
                                    .filter((m) => m.role === "CUSTOMER") // chỉ hiện chat giữa người dùng
                                    .map((m, i) => (
                                        <div
                                            key={i}
                                            className={`chat-message ${m.name === namechat ? "mine" : "other"
                                                }`}
                                        >
                                            <strong>{m.name}:</strong> {m.message}
                                        </div>
                                    ))}
                            </div>
                            <div className="chat-input-area">
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn của bạn..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                />
                                <button onClick={() => handleSendChat(3)}>Gửi</button>
                            </div>
                        </section>
                    )}

                    {/* Hỏi admin */}
                    {activeSection === 4 && (
                        <section className="support-section section-ask-admin">
                            <h2>4️⃣ Hỏi admin</h2>
                            <div className="chat-box" ref={chatBoxRef}>
                                    {messagesList
                                        .filter((m) => m.role === "ADMIN" && m.name === namechat) // chỉ hiện chat với admin
                                    .map((m, i) => (
                                        <div
                                            key={i}
                                            className={`chat-message ${m.name === namechat ? "mine" : "other"
                                                }`}
                                        >
                                            <strong>{m.name}:</strong> {m.message}
                                        </div>
                                    ))}
                            </div>
                            <div className="chat-input-area">
                                <textarea
                                    placeholder="Nhập câu hỏi của bạn cho admin..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                />
                                <button onClick={() => handleSendChat(4)}>Gửi</button>
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
