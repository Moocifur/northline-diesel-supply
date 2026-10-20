import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function PUT() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return NextResponse.json({ message: 'You must be logged in' }, { status: 401 })
    }

    const apiResponse = await fetch(`${process.env.API_URL}/users/me/request-wholesale`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
        return NextResponse.json(data, { status: apiResponse.status })
    }

    return NextResponse.json(data)
}
