import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { getMe } from '../api/auth'

// Only lets admins through. A customer account can log in on the storefront, but the API rejects
// every admin request from it, so there is no point showing them an empty admin shell.
function ProtectedRoute({ children }) {
    const [status, setStatus] = useState('checking')

    useEffect(() => {
        getMe()
            .then((me) => setStatus(me.isAdmin ? 'authenticated' : 'unauthenticated'))
            .catch(() => setStatus('unauthenticated'))
    }, [])

    if (status === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading...
            </div>
        )
    }
    if (status === 'unauthenticated') return <Navigate to="/login" />

    return children
}

export default ProtectedRoute
