import React, { useState, useEffect } from 'react';
import { CustomerService } from "../services/Customerservice";
import '../styles/CustomerManagement.css';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [billLoading, setBillLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        size: 10
    });

    const [filters, setFilters] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        type: ''
    });

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerBills, setCustomerBills] = useState([]);
    const [movieFilter, setMovieFilter] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, [pagination.currentPage, pagination.size]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                size: pagination.size,
                ...filters
            };

            const response = await CustomerService.getAllCustomers(params);
            setCustomers(response.content);
            setPagination(prev => ({
                ...prev,
                totalPages: response.totalPages,
                totalElements: response.totalElements
            }));
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, currentPage: 0 }));
        fetchCustomers();
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const fetchCustomerBills = async (customerId, movieTitle = '') => {
        setBillLoading(true);
        try {
            const bills = await CustomerService.getCustomerBills(customerId, movieTitle);
            console.log("Bills:", bills);
            setCustomerBills(bills || []);
        } catch (error) {
            console.error('Error fetching customer bills:', error);
            setCustomerBills([]);
        } finally {
            setBillLoading(false);
        }
    };

    const handleViewBills = (customer) => {
        setSelectedCustomer(customer);
        setCustomerBills([]);
        setMovieFilter('');
        fetchCustomerBills(customer.customerId); // fetch nhưng modal mở liền
    };

    return (
        <div className="customer-management">
            <h2>Customer Management</h2>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-row">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={filters.fullName}
                        onChange={(e) => handleFilterChange('fullName', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Email"
                        value={filters.email}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={filters.phoneNumber}
                        onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
                    />
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="MEMBER">Member</option>
                        <option value="GUEST">Guest</option>
                    </select>
                    <button onClick={handleSearch} className="search-btn">Search</button>
                </div>
            </div>

            {/* Customer Table */}
            <div className="table-container">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <table className="customer-table">
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Date of Birth</th>
                                <th>Type</th>
                                <th>Username</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.customerId}>
                                    <td>{customer.fullName}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phoneNumber}</td>
                                    <td>{customer.dateOfBirth}</td>
                                    <td>
                                        <span className={`type-badge ${customer.type.toLowerCase()}`}>
                                            {customer.type}
                                        </span>
                                    </td>
                                    <td>{customer.account?.username}</td>
                                    <td>
                                        <button
                                            onClick={() => handleViewBills(customer)}
                                            className="action-btn view-bills-btn"
                                        >
                                            View Bills
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                >
                    Previous
                </button>
                <span>
                    Page {pagination.currentPage + 1} of {pagination.totalPages} ({pagination.totalElements} total customers)
                </span>
                <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                >
                    Next
                </button>
            </div>

            {/* Bills Modal */}
            {selectedCustomer && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Bills for {selectedCustomer.fullName}</h3>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="close-btn"
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Search Filter */}
                            <div className="movie-filter">
                                <input
                                    type="text"
                                    placeholder="Search by movie title..."
                                    value={movieFilter}
                                    onChange={(e) => setMovieFilter(e.target.value)}
                                />
                                <button
                                    onClick={() => fetchCustomerBills(selectedCustomer.customerId, movieFilter)}
                                    className="search-btn"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Bills List */}
                            {billLoading ? (
                                <div className="loading">Loading bills...</div>
                            ) : customerBills.length === 0 ? (
                                <p>No bills found for this customer.</p>
                            ) : (
                                <div className="bills-list">
                                    {customerBills.map((bill) => (
                                        <div key={bill.billId} className="bill-item">
                                            <h4>{bill.movieTitle}</h4>
                                            <p><strong>Total:</strong> ${bill.totalAmount}</p>
                                            <p><strong>Room:</strong> {bill.roomName}</p>
                                            <p><strong>Seats:</strong> {bill.seats.join(', ')}</p>
                                            <p><strong>Show Time:</strong> {new Date(bill.startTime).toLocaleString()}</p>
                                            <p><strong>Payment:</strong> {bill.paymentMethod}</p>

                                            {bill.orderDetails?.length > 0 && (
                                                <div className="order-details">
                                                    <strong>Services:</strong>
                                                    {bill.orderDetails.map((detail) => (
                                                        <span key={detail.id} className="service-item">
                                                            {detail.serviceName} (x{detail.quantity}) - ${detail.price}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
