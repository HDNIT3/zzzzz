import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home, Film, User, Users, Calendar, BookOpen, Star, Hash, 
  Clapperboard, UserCog, Tags, BarChart3, PieChart, ClipboardList, 
  Settings, Shield 
} from "lucide-react";
import { LoginForm } from "./modals/LoginForm";
import { RegisterForm } from "./modals/RegisterForm";
import { useAuth } from "../hooks/useAuth"; 
import "../styles/header.css";

// Menu cơ bản
const baseMenu = {
  CUSTOMER: [
    { path: '/', label: 'Home', icon: Home },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/services', label: 'Bookings', icon: BookOpen },
    { path: '/events', label: 'Events', icon: Star },
    { path: '/profile', label: 'Profile', icon: User }
  ],
  STAFF: [
    { path: '/pos-booking', label: 'Booking', icon: Hash },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/shifts', label: 'Shifts', icon: Calendar }
  ],
  MANAGER: [
    { path: '/manage/operations', label: 'Manage Movies - Rooms - Showtimes', icon: Clapperboard },
    { path: '/manage/human-resources', label: 'Staff & Shifts', icon: UserCog },
    { path: '/manage/promotions', label: 'Manage Promotions', icon: Tags },
    { path: '/reports/revenue', label: 'Revenue Report', icon: BarChart3 },
    { path: '/reports/showtimes', label: 'Showtimes Report', icon: PieChart },
    { path: '/reports/staff', label: 'Staff Report', icon: ClipboardList },
  ],
  ADMIN: [
    { path: '/admin/system', label: 'System Settings', icon: Settings },
    { path: '/admin/accounts', label: 'Manage Accounts', icon: Shield },
  ]
};

const roleHierarchy = {
  CUSTOMER: ['CUSTOMER'],
  STAFF: ['CUSTOMER', 'STAFF'],
  MANAGER: ['CUSTOMER', 'STAFF', 'MANAGER'],
  ADMIN: ['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN'],
};

function getMenuByRole(role) {
  const roles = roleHierarchy[role] || [];
  const menu = [];
  roles.forEach(r => {
    menu.push(...(baseMenu[r] || []));
  });
  return menu;
}

export default function Header() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Get menu items based on user role
  const menu = user ? getMenuByRole(user.role) : [];

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleCloseModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <>
      <header className="cinema-header">
        <div className="logo">CinemUTE</div>
        
        <div className="nav-container">
          {/* Navigation Menu */}
          {user && (
            <nav>
              <ul className="nav-menu">
                {menu.map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.path} className="nav-item">
                      {item.icon && <item.icon className="nav-icon" />}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Auth Section */}
          {user ? (
            <div className="user-info">
              <span className="user-welcome">
                Welcome, {user.fullName || user.username}
              </span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="header-auth-buttons">
              <button 
                onClick={() => setShowLogin(true)} 
                className="header-auth-btn"
              >
                Login
              </button>
              <button 
                onClick={() => setShowRegister(true)} 
                className="header-auth-btn primary"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <LoginForm 
          onClose={handleCloseModals}
          onSwitchToRegister={handleSwitchToRegister}
          useAuth={useAuth}
        />
      )}

      {/* Register Modal */}
      {showRegister && (
        <RegisterForm 
          onClose={handleCloseModals}
          onSwitchToLogin={handleSwitchToLogin}
          useAuth={useAuth}
        />
      )}
    </>
  );
}