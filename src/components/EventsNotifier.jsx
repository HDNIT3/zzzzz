import React, { useEffect, useMemo, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import '../styles/events.css';

// LocalStorage keys
const STORAGE_FEED_KEY = 'ev-feed';
const STORAGE_PREF_KEY = 'ev-notif-prefs';

// Default preferences
const defaultPrefs = {
    sound: true,
    desktop: false,
    dnd: false, // Do Not Disturb
};

// Base64 tiny chime sound (~1.6KB), non-blocking
const CHIME_SRC =
    'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQAAACAAABBpc3QAAAACAAACAAACAAACAAAC...'; // shortened for brevity; optionally replace with your asset

function loadFeed() {
    try {
        const raw = localStorage.getItem(STORAGE_FEED_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        return [];
    } catch {
        return [];
    }
}
function saveFeed(feed) {
    try {
        localStorage.setItem(STORAGE_FEED_KEY, JSON.stringify(feed));
    } catch { }
}

function loadPrefs() {
    try {
        const raw = localStorage.getItem(STORAGE_PREF_KEY);
        if (!raw) return defaultPrefs;
        const parsed = JSON.parse(raw);
        return { ...defaultPrefs, ...parsed };
    } catch {
        return defaultPrefs;
    }
}
function savePrefs(p) {
    try {
        localStorage.setItem(STORAGE_PREF_KEY, JSON.stringify(p));
    } catch { }
}

function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 10) return 'vừa xong';
    if (s < 60) return `${s}s trước`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h trước`;
    const d = Math.floor(h / 24);
    return `${d}d trước`;
}

export default function EventsNotifier() {
    // Feed state
    const [feed, setFeed] = useState(() => loadFeed());
    const [open, setOpen] = useState(false);
    const [prefs, setPrefs] = useState(() => loadPrefs());

    // Toast queue
    const [toasts, setToasts] = useState([]);
    const toastQueueRef = useRef([]);

    const unread = useMemo(() => feed.filter((e) => !e.read).length, [feed]);

    // STOMP
    const clientRef = useRef(null);
    const subRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        // Setup audio lazily
        audioRef.current = new Audio(CHIME_SRC);
        audioRef.current.volume = 0.5;

        const WS_URL = `${window.location.protocol}//${window.location.hostname}:8080/ws/events`;
        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 4000,
            onConnect: () => {
                subRef.current = client.subscribe('/topic/events', (msg) => {
                    try {
                        const evt = JSON.parse(msg.body);
                        handleIncoming(evt);
                    } catch (e) {
                        console.error('Invalid event payload', e);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist feed on change
    useEffect(() => {
        saveFeed(feed);
    }, [feed]);

    // Persist prefs on change
    useEffect(() => {
        savePrefs(prefs);
    }, [prefs]);

    async function maybeDesktopNotify(e) {
        if (!prefs.desktop || prefs.dnd) return;
        try {
            // Ask permission once
            if (Notification && Notification.permission === 'default') {
                await Notification.requestPermission();
            }
            if (Notification && Notification.permission === 'granted') {
                const body = [
                    e.description ? e.description : '',
                    e.discountPercent != null ? `Giảm ${Number(e.discountPercent).toFixed(0)}%` : '',
                    e.discountStartDate || e.discountEndDate ? `${e.discountStartDate || '—'} → ${e.discountEndDate || '—'}` : ''
                ].filter(Boolean).join('\n');
                new Notification(`Sự kiện mới: ${e.name}`, {
                    body,
                    icon: '/favicon.ico',
                });
            }
        } catch { }
    }

    function playChime() {
        if (!prefs.sound || prefs.dnd) return;
        try { audioRef.current?.play().catch(() => { }); } catch { }
    }

    function pushToast(e) {
        if (prefs.dnd) return;
        const item = {
            id: `${e._id}`,
            title: e.name,
            body: e.description || '',
            pct: e.discountPercent != null ? Number(e.discountPercent).toFixed(0) : null,
            period: (e.discountStartDate || e.discountEndDate) ? `${e.discountStartDate || '—'} → ${e.discountEndDate || '—'}` : '',
        };
        // Queue control: max 3 visible
        toastQueueRef.current.push(item);
        flushToasts();
    }

    function flushToasts() {
        setToasts((curr) => {
            const active = [...curr];
            while (active.length < 3 && toastQueueRef.current.length > 0) {
                const next = toastQueueRef.current.shift();
                active.push(next);
                // Auto remove after 5s
                setTimeout(() => {
                    setToasts((c) => c.filter((x) => x.id !== next.id));
                }, 5000);
            }
            return active;
        });
    }

    function handleIncoming(evt) {
        // Normalize and augment
        const now = Date.now();
        const incoming = {
            ...evt,
            _id: `${evt.eventId || ''}-${now}`,
            ts: now,
            read: false,
        };
        setFeed((prev) => {
            const next = [incoming, ...prev].slice(0, 50);
            return next;
        });
        // Notify
        playChime();
        pushToast(incoming);
        maybeDesktopNotify(incoming);
    }

    function toggleOpen() {
        setOpen((o) => !o);
    }

    function markAllAsRead() {
        setFeed((prev) => prev.map((e) => ({ ...e, read: true })));
    }

    function clearAll() {
        if (!window.confirm('Xóa toàn bộ danh sách thông báo sự kiện?')) return;
        setFeed([]);
    }

    function togglePref(key) {
        setPrefs((p) => ({ ...p, [key]: !p[key] }));
    }

    function markOneRead(id) {
        setFeed((prev) => prev.map((e) => (e._id === id ? { ...e, read: true } : e)));
    }

    return (
        <div className="ev-bell-wrap">
            <button
                className="ev-bell-btn"
                onClick={() => {
                    toggleOpen();
                }}
                title="Events & Promotions"
                aria-label="Events notifications"
            >
                <span className="ev-bell-icon">🔔</span>
                {unread > 0 ? <span className="ev-bell-badge">{unread > 99 ? '99+' : unread}</span> : null}
                {unread > 0 ? <span className="ev-bell-dot" /> : null}
            </button>

            {open && (
                <div className="ev-dropdown ev-drop-wide">
                    <div className="ev-dropdown-header">
                        <div className="ev-drop-title">
                            <strong>Events & Promotions</strong>
                            <span className="ev-drop-sub">Thông báo sự kiện mới theo thời gian thực</span>
                        </div>
                        <div className="ev-drop-actions">
                            <button className="ev-chip" onClick={markAllAsRead} disabled={!unread}>Đánh dấu đã đọc</button>
                            <button className="ev-chip danger" onClick={clearAll} disabled={feed.length === 0}>Xóa tất cả</button>
                            <div className="ev-chip split">
                                <span>Cài đặt</span>
                                <div className="ev-split-menu">
                                    <label className="ev-tgl">
                                        <input type="checkbox" checked={prefs.sound} onChange={() => togglePref('sound')} />
                                        <span>Âm thanh</span>
                                    </label>
                                    <label className="ev-tgl">
                                        <input type="checkbox" checked={prefs.desktop} onChange={() => togglePref('desktop')} />
                                        <span>Desktop notifications</span>
                                    </label>
                                    <label className="ev-tgl">
                                        <input type="checkbox" checked={prefs.dnd} onChange={() => togglePref('dnd')} />
                                        <span>Do Not Disturb</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {feed.length === 0 ? (
                        <div className="ev-empty">Chưa có thông báo</div>
                    ) : (
                        <div className="ev-list ev-list-scroll">
                            {feed.map((e) => {
                                const pct = e.discountPercent != null ? Number(e.discountPercent).toFixed(0) : null;
                                return (
                                    <div
                                        key={e._id}
                                        className={`ev-item ${!e.read ? 'unread' : ''}`}
                                        onMouseEnter={() => markOneRead(e._id)}
                                    >
                                        <div className="ev-item-head">
                                            <div className="ev-item-title">
                                                {e.name}
                                                {!e.read ? <span className="ev-dot-mini" /> : null}
                                            </div>
                                            <div className="ev-item-time">{timeAgo(e.ts)}</div>
                                        </div>
                                        {e.description ? <div className="ev-item-desc">{e.description}</div> : null}
                                        <div className="ev-item-meta">
                                            {pct && <span className={`ev-badge ${pct >= 50 ? 'ev-badge-hot' : ''}`}>Giảm {pct}%</span>}
                                            {(e.discountStartDate || e.discountEndDate) && (
                                                <span className="ev-period">
                                                    {e.discountStartDate || '—'} → {e.discountEndDate || '—'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Toasts */}
            <div className="ev-toast-wrap">
                {toasts.map((t) => (
                    <div className="ev-toast" key={t.id}>
                        <div className="ev-toast-head">
                            <span className="ev-toast-title">{t.title}</span>
                            {t.pct && <span className="ev-badge ev-badge-ghost">-{t.pct}%</span>}
                        </div>
                        {t.body ? <div className="ev-toast-body">{t.body}</div> : null}
                        {t.period ? <div className="ev-toast-meta">{t.period}</div> : null}
                    </div>
                ))}
            </div>
        </div>
    );
}