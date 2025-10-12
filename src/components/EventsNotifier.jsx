import React, { useEffect, useState } from 'react';
import { useEventSocket } from '../context/EventSocketContext';

const styles = {
    wrapper: { position: 'relative', display: 'inline-block', marginLeft: 16 },
    bell: { cursor: 'pointer', position: 'relative', fontSize: 20 },
    dot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#ff4d4f',
    },
    dropdown: {
        position: 'absolute',
        right: 0,
        top: 28,
        width: 320,
        maxHeight: 400,
        overflowY: 'auto',
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 1000,
    },
    item: { padding: '10px 12px', borderBottom: '1px solid #f3f3f3' },
    empty: { padding: '12px', color: '#888' },
    header: { padding: 10, fontWeight: 600, borderBottom: '1px solid #f3f3f3' },
};

export default function EventsNotifier() {
    const { connected, lastEvent, eventFeed, clearLastEvent } = useEventSocket();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (lastEvent) {
            // auto-close dot after 6s
            const t = setTimeout(() => {
                clearLastEvent();
            }, 6000);
            return () => clearTimeout(t);
        }
    }, [lastEvent, clearLastEvent]);

    return (
        <div style={styles.wrapper}>
            <div
                style={styles.bell}
                onClick={() => {
                    setOpen((o) => !o);
                    clearLastEvent();
                }}
                title={connected ? 'Event notifications' : 'Connecting...'}
            >
                🔔
                {lastEvent ? <span style={styles.dot} /> : null}
            </div>

            {open && (
                <div style={styles.dropdown}>
                    <div style={styles.header}>Events & Promotions</div>
                    {eventFeed.length === 0 ? (
                        <div style={styles.empty}>No new events</div>
                    ) : (
                        eventFeed.map((e, idx) => (
                            <div key={(e.eventId || '') + idx} style={styles.item}>
                                <div style={{ fontWeight: 600 }}>{e.name}</div>
                                {e.description ? (
                                    <div style={{ color: '#666', marginTop: 4 }}>{e.description}</div>
                                ) : null}
                                <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                                    {e.discountPercent ? `Discount: ${e.discountPercent}%` : ''}
                                    {e.discountStartDate || e.discountEndDate
                                        ? ` | ${e.discountStartDate || ''} → ${e.discountEndDate || ''}`
                                        : ''}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}