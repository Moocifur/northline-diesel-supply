import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

async function getAuthToken() {
    const cookieStore = await cookies()
    return cookieStore.get('token')?.value
}

export async function fetchParts(page, limit, search) {
    const token = await getAuthToken()
    const params = new URLSearchParams()
    if (page && limit) {
        params.set('page', page)
        params.set('limit', limit)
    }
    if (search) {
        params.set('search', search)
    }
    const query = params.toString()
    const url = query ? `${process.env.API_URL}/parts?${query}` : `${process.env.API_URL}/parts`

    const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Failed to fetch parts')
    }

    const parts = await response.json()
    const total = Number(response.headers.get('X-Total-Count')) || parts.length
    return { parts, total }
}

export async function fetchPart(id) {
    const token = await getAuthToken()

    const response = await fetch(`${process.env.API_URL}/parts/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        cache: 'no-store'
    })

    // Unknown ids and hidden (inactive) parts both come back as 404 from the API.
    if (response.status === 404) {
        notFound()
    }
    if (!response.ok) {
        throw new Error('Failed to fetch part')
    }

    return response.json()
}

export async function fetchMe() {
    const token = await getAuthToken()

    const response = await fetch(`${process.env.API_URL}/users/me`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Failed to fetch account')
    }

    return response.json()
}

export async function fetchMyOrders() {
    const token = await getAuthToken()

    const response = await fetch(`${process.env.API_URL}/orders/mine`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Failed to fetch orders')
    }

    return response.json()
}
