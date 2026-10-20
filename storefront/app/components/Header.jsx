'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Phone, Mail, Clock, Menu, X, ShoppingCart } from 'lucide-react'
import LogoutButton from '../LogoutButton'
import Logo from './Logo'
import { SITE } from '@/lib/site'
import { useCart } from '../context/CartContext'

const Header = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const headerRef = useRef(null)
    const { itemCount } = useCart()
    const isLoggedIn = !!user

    useEffect(() => {
        if (!isMenuOpen) return

        const handleClickOutside = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setIsMenuOpen(false)
            }
        }
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isMenuOpen])

    return (
        <>
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="hidden md:flex justify-between items-center py-2 text-sm border-b border-gray-700">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-blue-400" />
                                <span>{SITE.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-blue-400" />
                                <span>{SITE.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>{SITE.hours}</span>
                        </div>
                    </div>
                </div>
            </div>

            <header ref={headerRef} className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                            <Logo className="w-12 h-12" />
                            <div>
                                <h1 className="text-2xl font-bold">{SITE.name}</h1>
                                <p className="text-sm text-gray-400">{SITE.tagline}</p>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
                            <Link href="/#features" className="hover:text-blue-400 transition-colors">Features</Link>
                            <Link href="/#about" className="hover:text-blue-400 transition-colors">Under the Hood</Link>
                            <Link href="/#contact" className="hover:text-blue-400 transition-colors">Contact</Link>
                            <Link href="/parts" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">Shop Parts</Link>
                            <Link href="/cart" className="relative hover:text-blue-400 transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                            {isLoggedIn ? (
                                <>
                                    <span className="text-sm text-gray-400">Hi, {user.name}</span>
                                    <Link href="/orders" className="hover:text-blue-400 transition-colors">My Orders</Link>
                                    <LogoutButton />
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link>
                                    <Link href="/register" className="hover:text-blue-400 transition-colors">Register</Link>
                                </>
                            )}
                        </nav>

                        <div className="flex items-center gap-4 md:hidden">
                            <Link href="/cart" className="relative hover:text-blue-400 transition-colors">
                                <ShoppingCart className="w-6 h-6" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    <nav
                        aria-hidden={!isMenuOpen}
                        className={`md:hidden grid transition-all duration-300 ease-in-out ${
                            isMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                    >
                        <div className="overflow-hidden">
                            <div
                                className={`flex flex-col space-y-4 ${isMenuOpen ? 'py-4 border-t border-gray-700' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
                                <Link href="/#features" className="hover:text-blue-400 transition-colors">Features</Link>
                                <Link href="/#about" className="hover:text-blue-400 transition-colors">Under the Hood</Link>
                                    <Link href="/#contact" className="hover:text-blue-400 transition-colors">Contact</Link>
                                <Link href="/parts" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors inline-block">Shop Parts</Link>
                                <Link href="/cart" className="hover:text-blue-400 transition-colors">
                                    Cart{itemCount > 0 ? ` (${itemCount})` : ''}
                                </Link>

                                <div className="border-t border-gray-700 pt-4">
                                    {isLoggedIn ? (
                                        <div className="flex flex-col space-y-4">
                                            <span className="text-sm text-gray-400">Hi, {user.name}</span>
                                            <Link href="/orders" className="hover:text-blue-400 transition-colors">My Orders</Link>
                                            <LogoutButton />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col space-y-4">
                                            <Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link>
                                            <Link href="/register" className="hover:text-blue-400 transition-colors">Register</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Header
