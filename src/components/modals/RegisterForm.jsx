import { useState } from "react";
import { User, Lock, Mail, Phone, Eye, EyeOff, X } from "lucide-react";
import "../../styles/register-form.css";
import { useAuth } from "../../hooks/useAuth";
export function RegisterForm({ onClose, onSwitchToLogin}) {
    const { register, sendOtp, verifyOtp } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "",
        role: "CUSTOMER",
    });
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!isOtpSent) {
            if (!formData.username.trim()) {
                newErrors.username = "Username is required";
            } else if (formData.username.length < 3) {
                newErrors.username = "Username must be at least 3 characters";
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }

            if (!formData.password) {
                newErrors.password = "Password is required";
            } else if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                newErrors.password =
                    "Password must contain at least one uppercase letter, one lowercase letter, and one number";
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Please confirm your password";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }

            if (!formData.fullName.trim()) {
                newErrors.fullName = "Full name is required";
            }

            if (!formData.phoneNumber.trim()) {
                newErrors.phoneNumber = "Phone number is required";
            } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s+/g, ""))) {
                newErrors.phoneNumber = "Please enter a valid phone number";
            }

            if (!formData.role) {
                newErrors.role = "Role is required";
            }
        } else {
            if (!otp.trim()) {
                newErrors.otp = "OTP is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOtp = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await sendOtp(formData.email); // Sử dụng sendOtp từ useAuth
            setIsOtpSent(true);
            setErrors({});
            return true;
        } catch (error) {
            setErrors({ general: error.message || "Failed to send OTP" });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtpAndRegister = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await verifyOtp(formData.email, otp); // Sử dụng verifyOtp từ useAuth
            const { confirmPassword, ...userData } = formData;
            await register(userData);
            onClose();
            return true;
        } catch (error) {
            setErrors({ otp: error.message || "Invalid or expired OTP" });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isOtpSent) {
            // Step 1: Validate form and send OTP
            await handleSendOtp();
        } else {
            // Step 2: Verify OTP and register
            await handleVerifyOtpAndRegister();
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="auth-overlay" onClick={handleOverlayClick}>
            <div className="auth-modal register">
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="auth-header">
                    <h2 className="auth-title">Join CinemUTE</h2>
                    <p className="auth-subtitle">
                        {isOtpSent
                            ? "Enter the OTP sent to your email"
                            : "Create your account to start your cinema journey"}
                    </p>
                </div>

                <div className="auth-form">
                    {errors.general && <div className="error-banner">{errors.general}</div>}

                    {!isOtpSent ? (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Username *</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="auth-input"
                                            placeholder="Choose a username"
                                        />
                                    </div>
                                    {errors.username && <div className="form-error">{errors.username}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="auth-input"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    {errors.email && <div className="form-error">{errors.email}</div>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="auth-input"
                                            placeholder="Create a password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <div className="form-error">{errors.password}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm Password *</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="auth-input"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <div className="form-error">{errors.confirmPassword}</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <div className="input-wrapper">
                                    <User className="input-icon" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="auth-input"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <div className="input-wrapper">
                                        <Phone className="input-icon" />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="auth-input"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    {errors.phoneNumber && <div className="form-error">{errors.phoneNumber}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Role *</label>
                                    <div className="input-wrapper">
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="auth-input"
                                        >
                                            <option value="CUSTOMER">CUSTOMER</option>
                                            <option value="STAFF">STAFF</option>
                                            <option value="MANAGER">MANAGER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>
                                    {errors.role && <div className="form-error">{errors.role}</div>}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">OTP *</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="auth-input"
                                    placeholder="Enter the OTP"
                                />
                            </div>
                            {errors.otp && <div className="form-error">{errors.otp}</div>}
                        </div>
                    )}

                    <button onClick={handleSubmit} disabled={isLoading} className="auth-btn">
                        {isLoading ? (
                            <div className="loading-content">
                                <div className="spinner"></div>
                                {isOtpSent ? "Verifying OTP..." : "Sending OTP..."}
                            </div>
                        ) : isOtpSent ? (
                            "Verify OTP and Register"
                        ) : (
                            "Send OTP"
                        )}
                    </button>

                    <div className="auth-switch">
                        Already have an account?{" "}
                        <button type="button" className="auth-switch-btn" onClick={onSwitchToLogin}>
                            Sign in here
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}