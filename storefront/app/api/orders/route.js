import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return NextResponse.json({ message: 'You must be logged in to check out' }, { status: 401 })
    }

    const body = await request.json()

    const apiResponse = await fetch(`${process.env.API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
        return NextResponse.json(data, { status: apiResponse.status })
    }

    return NextResponse.json(data, { status: 201 })
}
