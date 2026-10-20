import { NextResponse } from 'next/server'

export async function POST(request) {
    const { email, password } = await request.json()

    const apiResponse = await fetch(`${process.env.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
    })

    if (!apiResponse.ok) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const { token } = await apiResponse.json()

    const response = NextResponse.json({ message: 'Logged in' })
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    })

    return response
}