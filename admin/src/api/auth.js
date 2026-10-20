const API_URL = import.meta.env.VITE_API_URL;

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error('Invalid email or password');
    }

    return response.json();
}

export async function logout() {
    await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });
}

export async function getMe() {
    const response = await fetch(`${API_URL}/users/me`, {
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Not authenticated');
    }

    return response.json();
}
