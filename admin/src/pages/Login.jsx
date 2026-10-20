import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock } from 'lucide-react'
import { login } from '../api/auth'

// Public on purpose: created by api/prisma/seed.js for the demo.
const DEMO_ADMIN = { email: 'admin@example.com', password: 'demo-admin-123' }

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await login(email, password)
            navigate('/parts')
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 p-6 sm:p-8 rounded-xl">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-5 h-5" />
                        Log In
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-700 text-sm">
                    <div className="text-gray-300 font-semibold mb-1">Demo admin account</div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-gray-400">
                            <div>{DEMO_ADMIN.email}</div>
                            <div>{DEMO_ADMIN.password}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password) }}
                            className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
                        >
                            Fill in
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">A demo with fictional data. Anyone can sign in, so please be gentle with it.</p>
                </div>
            </div>
        </div>
    )
}

export default Login
