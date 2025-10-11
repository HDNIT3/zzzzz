const API_BASE_URL = 'http://localhost:8080/api/customers';

export const CustomerService = {
    getAllCustomers: async (params = {}) => {
        const queryParams = new URLSearchParams();

        // Add pagination and sorting params
        queryParams.append('page', params.page || 0);
        queryParams.append('size', params.size || 10);
        queryParams.append('sortBy', params.sortBy || 'customerId');
        queryParams.append('sortDir', params.sortDir || 'asc');

        // Add filter params if provided
        if (params.fullName) queryParams.append('fullName', params.fullName);
        if (params.email) queryParams.append('email', params.email);
        if (params.phoneNumber) queryParams.append('phoneNumber', params.phoneNumber);
        // Only add type if it's a valid enum value
        if (params.type && (params.type === 'MEMBER' || params.type === 'GUEST')) {
            queryParams.append('type', params.type);
        }

        const response = await fetch(`${API_BASE_URL}?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        return response.json();
    },

    updateCustomer: async (customerId, customerData) => {
        const response = await fetch(`${API_BASE_URL}/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData),
        });
        if (!response.ok) throw new Error('Failed to update customer');
        return response.json();
    },

    getCustomerBills: async (customerId, movieTitle = '') => {
        let url = `${API_BASE_URL}/${customerId}/bills`;
        if (movieTitle) {
            url += `?movieTitle=${encodeURIComponent(movieTitle)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch customer bills');
        return response.json();
    }
};
