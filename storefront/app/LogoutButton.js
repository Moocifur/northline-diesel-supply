// storefront/app/LogoutButton.js
'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' })
        router.push('/')
        router.refresh()
    }

    return <button onClick={handleLogout} className="hover:text-blue-400 transition-colors">Logout</button>
}