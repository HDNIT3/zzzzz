import { useState } from "react";
import { User, Lock, Eye, EyeOff, X } from "lucide-react";
import "../../styles/login-form.css"

export function LoginForm({ onClose, onSwitchToRegister, useAuth }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await login(formData.username, formData.password);
      onClose();
    } catch (error) {
      setErrors({ general: "Invalid username or password" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your CinemUTE account</p>
        </div>

        <div className="auth-form">
          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="auth-input"
                placeholder="Enter your username"
              />
            </div>
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                placeholder="Enter your password"
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

          <div className="form-options">
            <label className="checkbox-wrapper">
              <input type="checkbox" />
              Remember me
            </label>
            <button type="button" className="forgot-link">
              Forgot password?
            </button>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isLoading} 
            className="auth-btn"
          >
            {isLoading ? (
              <div className="loading-content">
                <div className="spinner"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="auth-switch">
            Don't have an account?{" "}
            <button 
              type="button"
              className="auth-switch-btn" 
              onClick={onSwitchToRegister}
            >
              Sign up here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}