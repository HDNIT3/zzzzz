import React, { useEffect, useState } from 'react';

const init = {
    name: '',
    description: '',
    discountPercent: 0,
    discountStartDate: '',
    discountEndDate: '',
};

export default function EventForm({ initial, onSubmit, onCancel, submitText = 'Create' }) {
    const [form, setForm] = useState(init);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initial) {
            setForm({
                name: initial.name || '',
                description: initial.description || '',
                discountPercent: initial.discountPercent ?? 0,
                discountStartDate: initial.discountStartDate || '',
                discountEndDate: initial.discountEndDate || '',
            });
        } else {
            setForm(init);
        }
    }, [initial]);

    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (form.discountPercent < 0) e.discountPercent = 'Discount must be >= 0';
        if (form.discountStartDate && form.discountEndDate) {
            if (form.discountEndDate < form.discountStartDate) {
                e.discountEndDate = 'End date must be after start date';
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit(ev) {
        ev.preventDefault();
        if (!validate()) return;
        onSubmit(form);
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            <div>
                <label>Name</label>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Event title"
                />
                {errors.name ? <div style={{ color: 'crimson', fontSize: 12 }}>{errors.name}</div> : null}
            </div>
            <div>
                <label>Description</label>
                <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description"
                    rows={3}
                />
            </div>
            <div>
                <label>Discount (%)</label>
                <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.discountPercent}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, discountPercent: Number(e.target.value || 0) }))
                    }
                />
                {errors.discountPercent ? (
                    <div style={{ color: 'crimson', fontSize: 12 }}>{errors.discountPercent}</div>
                ) : null}
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
                    {errors.discountEndDate ? (
                        <div style={{ color: 'crimson', fontSize: 12 }}>{errors.discountEndDate}</div>
                    ) : null}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button type="submit">{submitText}</button>
                {onCancel ? (
                    <button type="button" onClick={onCancel} style={{ background: '#f5f5f5' }}>
                        Cancel
                    </button>
                ) : null}
            </div>
        </form>
    );
}