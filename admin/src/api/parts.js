import { readError } from './http';

const API_URL = import.meta.env.VITE_API_URL;

export async function getParts(page, limit, search) {
    const params = new URLSearchParams();
    if (page && limit) {
        params.set('page', page);
        params.set('limit', limit);
    }
    if (search) {
        params.set('search', search);
    }
    const query = params.toString();
    const url = query ? `${API_URL}/parts?${query}` : `${API_URL}/parts`;
    const response = await fetch(url, {
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to fetch parts'));
    }

    const parts = await response.json();
    const total = Number(response.headers.get('X-Total-Count')) || parts.length;
    return { parts, total };
}

export async function createPart(data) {
    const response = await fetch(`${API_URL}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to create part'));
    }

    return response.json();
}

export async function updatePart(id, data) {
    const response = await fetch(`${API_URL}/parts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to update part'));
    }

    return response.json();
}

export async function deletePart(id) {
    const response = await fetch(`${API_URL}/parts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(await readError(response, 'Failed to delete part'));
    }
}
