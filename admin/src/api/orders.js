import { readError } from './http';

const API_URL = import.meta.env.VITE_API_URL;

export async function getOrders() {
    const response = await fetch(`${API_URL}/orders`, {
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to fetch orders'));
    }

    return response.json();
}

export async function updateCoreStatus(orderId, itemId, coreStatus) {
    const response = await fetch(`${API_URL}/orders/${orderId}/items/${itemId}/core-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ coreStatus })
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to update core status'));
    }

    return response.json();
}

export async function updateOrderStatus(orderId, status) {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to update order status'));
    }

    return response.json();
}
