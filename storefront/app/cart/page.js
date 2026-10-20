'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingCart, AlertCircle, Minus, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import CoreChargeInfo from '../components/CoreChargeInfo'
import { money } from '@/lib/format'

const getUnitPrice = (item) => Number(item.wholesalePrice ?? item.price ?? 0)

const getLineSavings = (item) => item.wholesalePrice
    ? (Number(item.price) - Number(item.wholesalePrice)) * item.quantity
    : 0

const getDiscountPercent = (item) => item.wholesalePrice
    ? Math.round((1 - Number(item.wholesalePrice) / Number(item.price)) * 100)
    : null

export default function CartPage() {
    const { cart, isLoaded, removeFromCart, updateQuantity, clearCart, refreshPrices } = useCart()
    const [error, setError] = useState('')
    const [needsLogin, setNeedsLogin] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(true)
    const router = useRouter()

    // The cart remembers prices from when each part was added. Re-fetch them once the cart has
    // loaded, so the totals match what the server will actually charge (wholesale prices, stock).
    useEffect(() => {
        if (!isLoaded) return
        let cancelled = false
        refreshPrices(cart.map(item => item.partId)).finally(() => {
            if (!cancelled) setIsRefreshing(false)
        })
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded])

    // Items that disappeared or sold out stay visible (so you know why) but never count toward totals.
    const available = cart.filter(item => !item.unavailable)
    const hasUnavailable = cart.some(item => item.unavailable)

    const subtotal = available.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0)
    const coreChargeTotal = available.reduce((sum, item) => sum + Number(item.coreCharge ?? 0) * item.quantity, 0)
    const total = subtotal + coreChargeTotal
    const hasCoreCharge = available.some(item => item.coreCharge)
    const totalSavings = available.reduce((sum, item) => sum + getLineSavings(item), 0)

    const handleCheckout = async () => {
        setError('')
        setNeedsLogin(false)
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: available.map(item => ({ partId: item.partId, quantity: item.quantity }))
                })
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 401) {
                    setNeedsLogin(true)
                }
                if (response.status === 409 || response.status === 400) {
                    // Stock or availability changed since the page loaded: show the latest.
                    refreshPrices(cart.map(item => item.partId))
                }
                throw new Error(data.message || 'Checkout failed')
            }

            clearCart()
            router.push('/orders?success=1')
        } catch (err) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isLoaded) {
        return (
            <main className="py-20">
                <div className="container mx-auto px-4 text-center text-gray-400">Loading your cart...</div>
            </main>
        )
    }

    if (cart.length === 0) {
        return (
            <main className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <Link href="/parts" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Browse the catalog
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/parts" className="text-blue-400 hover:text-blue-300 transition-colors inline-block mb-8">
                    ← Back to catalog
                </Link>

                <h1 className="text-4xl font-bold mb-10 text-center">Your Cart</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300">
                            {error}
                            {needsLogin && (
                                <>
                                    {' '}— <Link href="/login?redirect=/cart" className="underline hover:text-red-200">Log In</Link>
                                </>
                            )}
                        </span>
                    </div>
                )}

                {hasUnavailable && (
                    <div className="mb-6 p-4 bg-yellow-900/40 border border-yellow-700 rounded-lg text-sm text-yellow-300">
                        Some items are no longer available. Remove them to continue.
                    </div>
                )}

                <div className="bg-gray-800 rounded-xl divide-y divide-gray-700">
                    {cart.map(item => (
                        <div key={item.partId} className={`p-6 flex items-center justify-between gap-4 ${item.unavailable ? 'opacity-60' : ''}`}>
                            <div>
                                <div className="text-sm text-blue-400 font-semibold">{item.partNumber}</div>
                                <div className="font-semibold">{item.description}</div>
                                {item.unavailable ? (
                                    <div className="text-xs text-yellow-400 mt-1">No longer available</div>
                                ) : (
                                    <>
                                        {item.coreCharge && (
                                            <div className="text-xs text-gray-400">+ ${money(item.coreCharge)} core charge each</div>
                                        )}
                                        {item.wholesalePrice && (
                                            <div className="text-xs text-green-400 mt-1">
                                                <span className="line-through text-gray-500">${money(item.price)}</span>{' '}
                                                {getDiscountPercent(item)}% off — save ${getLineSavings(item).toFixed(2)}
                                            </div>
                                        )}
                                        {item.notice && (
                                            <div className="text-xs text-yellow-400 mt-1">{item.notice}</div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {!item.unavailable && (
                                    <>
                                        <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden shrink-0">
                                            <button
                                                onClick={() => updateQuantity(item.partId, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="px-2 py-1.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.quantityOnHand}
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.partId, Number(e.target.value))}
                                                className="w-12 py-1.5 bg-gray-900 text-center border-x border-gray-600 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.partId, item.quantity + 1)}
                                                disabled={item.quantityOnHand !== undefined && item.quantity >= item.quantityOnHand}
                                                className="px-2 py-1.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="w-20 text-right font-semibold">
                                            ${(getUnitPrice(item) * item.quantity).toFixed(2)}
                                        </div>
                                    </>
                                )}
                                <button onClick={() => removeFromCart(item.partId)} className="text-gray-400 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {hasCoreCharge && (
                    <div className="mt-6">
                        <CoreChargeInfo />
                    </div>
                )}

                <div className="bg-gray-800 rounded-xl p-6 mt-6 space-y-2">
                    <div className="flex justify-between text-gray-300">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {totalSavings > 0 && (
                        <div className="flex justify-between text-green-400">
                            <span>Wholesale Savings</span>
                            <span>-${totalSavings.toFixed(2)}</span>
                        </div>
                    )}
                    {coreChargeTotal > 0 && (
                        <div className="flex justify-between text-gray-300">
                            <span>Core Charges</span>
                            <span>${coreChargeTotal.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-2 mt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={isSubmitting || isRefreshing || hasUnavailable || available.length === 0}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    {isSubmitting ? 'Placing Order...' : isRefreshing ? 'Updating prices...' : 'Place Order'}
                </button>
            </div>
        </main>
    )
}
