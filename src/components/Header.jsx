import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Home, Film, User, Users, Calendar, BookOpen, Star, Hash,
    Clapperboard, UserCog, BarChart3, PieChart, ClipboardList,
    Settings, Shield
} from "lucide-react";
import cinema from "../assets/cinema.png";
import { LoginForm } from "./modals/LoginForm";
import { RegisterForm } from "./modals/RegisterForm";
import { useAuth } from "../hooks/useAuth";
import "../styles/header.css";

// WebSocket tối giản ngay trong Header (không dùng Context)
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const baseMenu = {
    CUSTOMER: [
        { label: "Home", path: "/", icon: Home },
        { label: "Movies - Booking", path: "/mov-bk", icon: Film },
        { label: "My Profile", path: "/prof", icon: User },
        { label: "My Bookings", path: "/bk-his", icon: BookOpen },
        { label: "Reviews", path: "/rev", icon: Star },
        { label: "Support", path: "/sup", icon: Hash },
    ],
    STAFF: [
        { label: "Home", path: "/", icon: Home },
        { label: "POS - Booking", path: "/mov-bk", icon: Clapperboard },
        { label: "Customer", path: "/cus", icon: Users },
        { label: "Transactions", path: "/trans", icon: Calendar },
        { label: "Schedule", path: "/sched", icon: Calendar },
        { label: "Support", path: "/sup", icon: Hash },
    ],
    MANAGER: [
        { label: "Home", path: "/", icon: Home },
        { label: "POS - Booking", path: "/pos", icon: Clapperboard },
        { label: "Customer", path: "/cus", icon: Users },
        { label: "Transactions", path: "/trans", icon: Calendar },
        { label: "Operation", path: "/op", icon: BarChart3 },
        { label: "Events - Promotions", path: "/ev-prom", icon: PieChart },
        { label: "Staff", path: "/staff", icon: UserCog },
        { label: "Schedule", path: "/sched", icon: Calendar },
        { label: "Reports", path: "/rep", icon: ClipboardList },
        { label: "Support", path: "/sup", icon: Hash },
    ],
    ADMIN: [
        { label: "Home", path: "/", icon: Home },
        { label: "POS - Booking", path: "/pos", icon: Clapperboard },
        { label: "Customer", path: "/cus", icon: Users },
        { label: "Transactions", path: "/trans", icon: Calendar },
        { label: "Operation", path: "/op", icon: BarChart3 },
        { label: "Events - Promotions", path: "/ev-prom", icon: PieChart },
        { label: "Staff", path: "/staff", icon: UserCog },
        { label: "Schedule", path: "/sched", icon: Calendar },
        { label: "Reports", path: "/rep", icon: ClipboardList },
        { label: "Settings", path: "/set", icon: Settings },
        { label: "Security", path: "/sec", icon: Shield },
        { label: "Support", path: "/sup", icon: Hash },
    ],
};

export default function Header() {
    const {
        user,
        logout,
        showLogin,
        openLoginModal,
        closeLoginModal,
    } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

    const menu = user ? baseMenu[user.role] : [];

    const handleSwitchToRegister = () => {
        closeLoginModal();
        setShowRegister(true);
    };

    const handleSwitchToLogin = () => {
        setShowRegister(false);
        openLoginModal();
    };

    const handleCloseModals = () => {
        closeLoginModal();
        setShowRegister(false);
    };

    // ==== Realtime events (đơn giản) ====
    const [openNotif, setOpenNotif] = useState(false);
    const [newDot, setNewDot] = useState(false);
    const [eventFeed, setEventFeed] = useState([]);
    const clientRef = useRef(null);
    const subRef = useRef(null);

    useEffect(() => {
        // Kết nối WS tới backend
        const WS_URL = `${window.location.protocol}//${window.location.hostname}:8080/ws/events`;
        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 4000,
            onConnect: () => {
                subRef.current = client.subscribe('/topic/events', (msg) => {
                    try {
                        const evt = JSON.parse(msg.body);
                        setEventFeed((prev) => [evt, ...prev].slice(0, 20));
                        setNewDot(true);
                    } catch (e) {
                        console.error('Invalid event message', e);
                    }
                });
            },
            onStompError: (f) => console.error('STOMP error', f.headers['message']),
        });
        clientRef.current = client;
        client.activate();

        return () => {
            try { subRef.current?.unsubscribe(); } catch { }
            client.deactivate();
        };
    }, []);

    return (
        <>
            <header className="cinema-header">
                <div className="header-left">
                    <div className="logo">CinemUTE</div>
                    <div className="icon"><img src={cinema} alt="#" /></div>
                </div>

                <div className="header-center">
                    <div className="nav-container">
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
                    </div>

                    <div className="header-right">
                        {/* Nút chuông realtime siêu gọn */}
                        <div style={{ position: 'relative', marginRight: 12 }}>
                            <button
                                aria-label="events"
                                onClick={() => {
                                    setOpenNotif((o) => !o);
                                    setNewDot(false);
                                }}
                                style={{ fontSize: 18, background: 'transparent', border: 'none', cursor: 'pointer' }}
                                title="Events & Promotions"
                            >
                                🔔
                            </button>
                            {newDot && (
                                <span style={{
                                    position: 'absolute', top: 2, right: 2,
                                    width: 10, height: 10, borderRadius: '50%', background: '#ff4d4f'
                                }} />
                            )}

                            {openNotif && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 28, width: 320, maxHeight: 400, overflowY: 'auto',
                                    background: '#fff', border: '1px solid #eee', borderRadius: 8,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 1000
                                }}>
                                    <div style={{ padding: 10, fontWeight: 600, borderBottom: '1px solid #f3f3f3' }}>
                                        Events & Promotions
                                    </div>
                                    {eventFeed.length === 0 ? (
                                        <div style={{ padding: 12, color: '#888' }}>No new events</div>
                                    ) : eventFeed.map((e, i) => (
                                        <div key={(e.eventId || '') + i} style={{ padding: '10px 12px', borderBottom: '1px solid #f7f7f7' }}>
                                            <div style={{ fontWeight: 600 }}>{e.name}</div>
                                            {e.description ? <div style={{ color: '#666', marginTop: 4 }}>{e.description}</div> : null}
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                                                {e.discountPercent ? `Discount: ${e.discountPercent}%` : ''}
                                                {(e.discountStartDate || e.discountEndDate)
                                                    ? ` | ${e.discountStartDate || ''} → ${e.discountEndDate || ''}`
                                                    : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {user ? (
                            <div className="user-info">
                                <span className="user-welcome">
                                    Welcome, {user.username}
                                </span>
                                <button onClick={logout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="header-auth-buttons">
                                <button
                                    onClick={openLoginModal}
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
                </div>
            </header>
        </>
    );
}