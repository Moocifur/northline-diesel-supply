'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import { SITE, DEMO_ACCOUNTS } from '@/lib/site'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirect') || '/'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
            setError('Invalid email or password')
            return
        }

        router.push(redirectTo)
        router.refresh()
    }

    return (
        <main className="flex justify-center p-4 py-20">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl h-fit">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Log In</h1>
                    <p className="text-gray-400">Welcome back to {SITE.name}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-white"
                    >
                        <LogIn className="w-5 h-5" />
                        <span>Log In</span>
                    </button>

                    <p className="text-sm text-gray-400 text-center">
                        Don&apos;t have an account? <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">Register</Link>
                    </p>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <h2 className="text-sm font-semibold text-gray-300 mb-3">Demo accounts</h2>
                    <ul className="space-y-2">
                        {DEMO_ACCOUNTS.map((account) => (
                            <li key={account.email} className="flex items-center justify-between gap-3 text-sm">
                                <div>
                                    <div className="text-white">{account.role}</div>
                                    <div className="text-xs text-gray-400">{account.note}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setEmail(account.email); setPassword(account.password) }}
                                    className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
                                >
                                    Fill in
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    )
}
