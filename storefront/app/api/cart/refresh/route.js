import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Looks up current prices and stock for the parts in the cart, as whoever is logged in right now.
// The login cookie is forwarded so wholesale customers get their wholesale prices.
export async function POST(request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    const { ids } = await request.json()

    const apiResponse = await fetch(`${process.env.API_URL}/parts/lookup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ids })
    })

    const data = await apiResponse.json()
    return NextResponse.json(data, { status: apiResponse.status })
}
