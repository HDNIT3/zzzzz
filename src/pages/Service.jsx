import React, { useEffect, useState } from 'react';
import { getAllServices } from '../services/UserService';
import { setSelectedServices } from '../SelectedServiceStore';

const PageService = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [selectedServices, updateSelectedServices] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchPrice, setSearchPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Fetch services từ API
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await getAllServices();
                setServices(data);
                setFilteredServices(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load service list.');
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    // ✅ Lọc dịch vụ
    useEffect(() => {
        let result = services;
        if (searchName.trim() !== '') {
            result = result.filter(s =>
                s.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }
        if (searchPrice.trim() !== '') {
            const priceValue = parseFloat(searchPrice);
            if (!isNaN(priceValue)) {
                result = result.filter(s => s.price <= priceValue);
            }
        }
        setFilteredServices(result);
    }, [searchName, searchPrice, services]);

    // ✅ Xử lý thay đổi số lượng
    const handleQuantityChange = (service, quantity) => {
        const q = Number(quantity);
        if (q <= 0) {
            const updated = selectedServices.filter(s => s.serviceId !== service.serviceId);
            updateSelectedServices(updated);
            setSelectedServices(updated);
            return;
        }

        const existing = selectedServices.find(s => s.serviceId === service.serviceId);
        let updated;
        if (existing) {
            updated = selectedServices.map(s =>
                s.serviceId === service.serviceId ? { ...s, quantity: q } : s
            );
        } else {
            updated = [...selectedServices, { ...service, quantity: q }];
        }

        updateSelectedServices(updated);
        setSelectedServices(updated); // ✅ Lưu ra biến toàn cục
    };

    // ✅ Xóa dịch vụ khỏi danh sách chọn
    const handleRemoveService = (id) => {
        const updated = selectedServices.filter(s => s.serviceId !== id);
        updateSelectedServices(updated);
        setSelectedServices(updated);
    };

    const totalPrice = selectedServices.reduce(
        (sum, s) => sum + s.price * s.quantity,
        0
    );

    if (loading) return <p>Loading services...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={styles.container}>
            {/* Thanh tìm kiếm */}
            <div style={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="number"
                    placeholder="Search by max price..."
                    value={searchPrice}
                    onChange={(e) => setSearchPrice(e.target.value)}
                    style={styles.input}
                />
            </div>

            {/* Danh sách dịch vụ */}
            <div style={styles.scrollContainer}>
                <div style={styles.grid}>
                    {filteredServices.length === 0 ? (
                        <p>No matching services found.</p>
                    ) : (
                        filteredServices.map((service, index) => (
                            <div key={index} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h4 style={styles.serviceName}>{service.name}</h4>
                                    <div style={styles.qtyBox}>
                                        <label style={styles.qtyLabel}>Qty:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                selectedServices.find(s => s.serviceId === service.serviceId)?.quantity || 0
                                            }
                                            onChange={(e) => handleQuantityChange(service, e.target.value)}
                                            style={styles.qtyInput}
                                        />
                                    </div>
                                </div>
                                <p style={styles.desc}>{service.description}</p>
                                <p><strong>Price:</strong> {service.price.toLocaleString()}$</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Dịch vụ đã chọn */}
            <div style={styles.preview}>
                <h3 style={{ marginBottom: '10px' }}>Selected Services</h3>
                {selectedServices.length === 0 ? (
                    <p>No services selected yet.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedServices.map((s, i) => (
                            <li key={i} style={styles.previewItem}>
                                <span>
                                    {s.name} × {s.quantity} — {(s.price * s.quantity).toLocaleString()}$
                                </span>
                                <button
                                    onClick={() => handleRemoveService(s.serviceId)}
                                    style={styles.removeBtn}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <h3 style={styles.total}>Total: {totalPrice.toLocaleString()}$</h3>
            </div>
        </div>
    );
};

// 🎨 Styles
const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    searchBox: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    input: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        width: '220px',
    },
    scrollContainer: {
        maxHeight: '420px',
        overflowY: 'auto',
        paddingRight: '5px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    card: {
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '15px',
        boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
    },
    serviceName: {
        margin: 0,
        fontSize: '16px',
        color: '#2c3e50',
    },
    qtyBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    qtyLabel: {
        fontSize: '14px',
        color: '#555',
    },
    qtyInput: {
        width: '55px',
        textAlign: 'center',
        padding: '4px',
        borderRadius: '5px',
        border: '1px solid #aaa',
    },
    desc: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '6px',
    },
    preview: {
        marginTop: '30px',
        backgroundColor: '#fafafa',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #eee',
    },
    previewItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #eee',
    },
    removeBtn: {
        backgroundColor: '#e74c3c',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        padding: '5px 10px',
        cursor: 'pointer',
    },
    total: {
        marginTop: '15px',
        textAlign: 'right',
        color: '#2c3e50',
    },
};

export default PageService;
