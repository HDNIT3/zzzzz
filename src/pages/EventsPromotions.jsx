import React, { useEffect, useMemo, useState } from 'react';
// Dùng axios instance chung để bảo đảm baseURL=8080 và có Bearer token interceptor
import client from '../services/api';
import { useAuth } from '../hooks/useAuth';

function formatDate(d) {
    if (!d) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    try {
        const dt = new Date(d);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    } catch {
        return d;
    }
}

export default function EventsPromotions() {
    const { user } = useAuth();
    const role = user?.role;
    const canManage = useMemo(() => role === 'ADMIN' || role === 'MANAGER', [role]);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    // Form tạo/sửa tối giản (không tách component)
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        discountPercent: 0,
        discountStartDate: '',
        discountEndDate: '',
    });
    const [editingId, setEditingId] = useState(null);

    const load = async () => {
        setLoading(true);
        setErr('');
        try {
            const res = await client.get('/api/events');
            const data = (res.data || []).map((e) => ({
                ...e,
                discountStartDate: formatDate(e.discountStartDate),
                discountEndDate: formatDate(e.discountEndDate),
            }));
            setEvents(data);
        } catch (e) {
            setErr(e?.response?.data?.error || e?.message || 'Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            discountPercent: 0,
            discountStartDate: '',
            discountEndDate: '',
        });
    };

    const startCreate = () => {
        resetForm();
        setCreating(true);
        setEditingId(null);
    };

    const startEdit = (e) => {
        setForm({
            name: e.name || '',
            description: e.description || '',
            discountPercent: e.discountPercent ?? 0,
            discountStartDate: e.discountStartDate || '',
            discountEndDate: e.discountEndDate || '',
        });
        setEditingId(e.eventId);
        setCreating(true);
    };

    const submit = async () => {
        try {
            const payload = {
                ...form,
                discountStartDate: form.discountStartDate || null,
                discountEndDate: form.discountEndDate || null,
            };
            if (!editingId) {
                const res = await client.post('/api/events', payload);
                const created = res.data;
                setEvents((prev) => [
                    { ...created, discountStartDate: formatDate(created.discountStartDate), discountEndDate: formatDate(created.discountEndDate) },
                    ...prev,
                ]);
            } else {
                const res = await client.put(`/api/events/${editingId}`, payload);
                const updated = res.data;
                setEvents((prev) =>
                    prev.map((x) => (x.eventId === editingId
                        ? { ...updated, discountStartDate: formatDate(updated.discountStartDate), discountEndDate: formatDate(updated.discountEndDate) }
                        : x))
                );
            }
            setCreating(false);
            setEditingId(null);
            resetForm();
        } catch (e) {
            alert(e?.response?.data?.error || e?.message || 'Request failed');
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await client.delete(`/api/events/${id}`);
            setEvents((prev) => prev.filter((x) => x.eventId !== id));
        } catch (e) {
            alert(e?.response?.data?.error || e?.message || 'Delete failed');
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Events & Promotions</h2>

            {loading ? (
                <div>Loading...</div>
            ) : err ? (
                <div style={{ color: 'crimson' }}>{err}</div>
            ) : (
                <>
                    {canManage && (
                        <div style={{ marginBottom: 16 }}>
                            {!creating ? (
                                <button onClick={startCreate}>+ New Event</button>
                            ) : (
                                <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
                                    <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Event' : 'Create Event'}</h3>
                                    <div style={{ display: 'grid', gap: 12 }}>
                                        <div>
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label>Description</label>
                                            <textarea
                                                rows={3}
                                                value={form.description}
                                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label>Discount (%)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.1"
                                                value={form.discountPercent}
                                                onChange={(e) => setForm((f) => ({ ...f, discountPercent: Number(e.target.value || 0) }))}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                <label>Start date</label>
                                                <input
                                                    type="date"
                                                    value={form.discountStartDate || ''}
                                                    onChange={(e) => setForm((f) => ({ ...f, discountStartDate: e.target.value }))}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label>End date</label>
                                                <input
                                                    type="date"
                                                    value={form.discountEndDate || ''}
                                                    onChange={(e) => setForm((f) => ({ ...f, discountEndDate: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={submit}>{editingId ? 'Update' : 'Create'}</button>
                                            <button onClick={() => { setCreating(false); setEditingId(null); }} style={{ background: '#f5f5f5' }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: '#fafafa' }}>
                                    <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Name</th>
                                    <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Description</th>
                                    <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Discount</th>
                                    <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Start</th>
                                    <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>End</th>
                                    {canManage ? <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Actions</th> : null}
                                </tr>
                            </thead>
                            <tbody>
                                {events.length === 0 ? (
                                    <tr><td colSpan={canManage ? 6 : 5} style={{ padding: 12 }}>No events</td></tr>
                                ) : events.map((e) => (
                                    <tr key={e.eventId}>
                                        <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{e.name}</td>
                                        <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{e.description || '-'}</td>
                                        <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{(e.discountPercent ?? 0) + '%'}</td>
                                        <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{e.discountStartDate || '-'}</td>
                                        <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{e.discountEndDate || '-'}</td>
                                        {canManage ? (
                                            <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>
                                                <button onClick={() => startEdit(e)} style={{ marginRight: 8 }}>Edit</button>
                                                <button onClick={() => remove(e.eventId)} style={{ background: '#ffecec' }}>Delete</button>
                                            </td>
                                        ) : null}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}