const API_URL = import.meta.env.VITE_API_URL;

export async function getUsers() {
    const response = await fetch(`${API_URL}/users`, {
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return response.json();
}

export async function approveWholesale(id) {
    const response = await fetch(`${API_URL}/users/${id}/approve-wholesale`, {
        method: 'PUT',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to approve wholesale');
    }

    return response.json();
}

export async function revokeWholesale(id) {
    const response = await fetch(`${API_URL}/users/${id}/revoke-wholesale`, {
        method: 'PUT',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to revoke wholesale');
    }

    return response.json();
}

export async function setWholesaleDiscount(id, discountPercent) {
    const response = await fetch(`${API_URL}/users/${id}/wholesale-discount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ discountPercent })
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update discount');
    }

    return response.json();
}

export async function makeAdmin(id) {
    const response = await fetch(`${API_URL}/users/${id}/make-admin`, {
        method: 'PUT',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to make admin');
    }

    return response.json();
}

export async function removeAdmin(id) {
    const response = await fetch(`${API_URL}/users/${id}/remove-admin`, {
        method: 'PUT',
        credentials: 'include'
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to remove admin');
    }

    return response.json();
}
