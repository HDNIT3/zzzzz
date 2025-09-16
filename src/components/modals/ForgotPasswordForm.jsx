import { useState } from "react";
import { User, Mail, X, ArrowLeft } from "lucide-react";
import "../../styles/forgot-password-form.css";;

export function ForgotPasswordForm({ onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TODO: Implement forgot password logic here
      // const result = await forgotPassword(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
    } catch (error) {
      setErrors({ general: "Failed to send reset instructions. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBackToLogin = () => {
    setIsSuccess(false);
    onSwitchToLogin();
  };

  return (
    <div className="forgot-password-overlay" onClick={handleOverlayClick}>
      <div className="forgot-password-modal register">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="forgot-password-header">
          {!isSuccess ? (
            <>
              <h2 className="forgot-password-title">Forgot Password?</h2>
              <p className="forgot-password-subtitle">
                Enter your username and email to reset your password
              </p>
            </>
          ) : (
            <>
              <h2 className="forgot-password-title">Check Your Email</h2>
              <p className="forgot-password-subtitle">
                We've sent password reset instructions to your email address
              </p>
            </>
          )}
        </div>

        <div className="forgot-password-form">
          {!isSuccess ? (
            <>
              {errors.general && <div className="error-banner">{errors.general}</div>}

              <div className="form-group">
                <label className="form-label">Username *</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="forgot-password-input"
                    placeholder="Enter your username"
                    disabled={isLoading}
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
                    className="forgot-password-input"
                    placeholder="Enter your email address"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="forgot-password-btn"
              >
                {isLoading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    Sending Reset Instructions...
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>

              <div className="forgot-password-switch">
                Remember your password?{" "}
                <button
                  type="button"
                  className="forgot-password-switch-btn"
                  onClick={onSwitchToLogin}
                  disabled={isLoading}
                >
                  <ArrowLeft size={16} style={{ marginRight: '4px' }} />
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="success-message">
                <div className="success-icon">
                  ✓
                </div>
                <p>
                  If an account with username "<strong>{formData.username}</strong>" and email "<strong>{formData.email}</strong>" exists, 
                  you will receive an email with instructions to reset your password.
                </p>
                <p>
                  Please check your email and follow the instructions to create a new password.
                </p>
              </div>

              <button
                onClick={handleBackToLogin}
                className="forgot-password-btn"
              >
                <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                Back to Login
              </button>

              <div className="forgot-password-switch">
                Didn't receive the email?{" "}
                <button
                  type="button"
                  className="forgot-password-switch-btn"
                  onClick={() => setIsSuccess(false)}
                >
                  Try again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}