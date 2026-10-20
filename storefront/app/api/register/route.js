import { NextResponse } from 'next/server'

export async function POST(request) {
  const { email, password, name, company } = await request.json()

  const apiResponse = await fetch(`${process.env.API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, company })
  })

  if (!apiResponse.ok) {
    return NextResponse.json({ message: 'Could not create account' }, { status: 400 })
  }

  const data = await apiResponse.json()
  return NextResponse.json(data)
}