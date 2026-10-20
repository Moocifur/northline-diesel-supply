'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

// The cart lives in localStorage and only remembers part ids, quantities and a snapshot of the
// part details for display. The snapshot can go stale (prices change, you log in as a wholesale
// customer, stock runs out), so the cart page calls refreshPrices() to re-fetch it from the server.
// The server always prices the real order itself, whatever is in here.
export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        try {
            const stored = localStorage.getItem('cart')
            if (stored) {
                // Reading localStorage is only possible after hydration, which is exactly what an
                // effect is for. Doing it during render would cause a server/client mismatch.
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCart(JSON.parse(stored))
            }
        } catch {
            // corrupted cart data: start with an empty cart
        }
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(cart))
        }
    }, [cart, isLoaded])

    const addToCart = (part, quantity = 1) => {
        const stock = part.quantityOnHand ?? Infinity

        setCart(prev => {
            const existing = prev.find(item => item.partId === part.id)
            if (existing) {
                return prev.map(item =>
                    item.partId === part.id
                        ? { ...item, quantity: Math.max(1, Math.min(item.quantity + quantity, stock)) }
                        : item
                )
            }
            return [...prev, {
                partId: part.id,
                partNumber: part.partNumber,
                description: part.description,
                price: part.price,
                wholesalePrice: part.wholesalePrice,
                coreCharge: part.coreCharge,
                quantityOnHand: part.quantityOnHand,
                quantity: Math.max(1, Math.min(quantity, stock))
            }]
        })
    }

    const removeFromCart = (partId) => {
        setCart(prev => prev.filter(item => item.partId !== partId))
    }

    const updateQuantity = (partId, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1) return
        setCart(prev => prev.map(item =>
            item.partId === partId
                ? { ...item, quantity: Math.min(quantity, item.quantityOnHand ?? Infinity), notice: undefined }
                : item
        ))
    }

    const clearCart = () => setCart([])

    // Re-fetches price, wholesale price, core charge and stock for the given part ids.
    // Parts that are gone or out of stock are flagged `unavailable` so the cart can say so.
    const refreshPrices = useCallback(async (ids) => {
        if (ids.length === 0) return

        try {
            const response = await fetch('/api/cart/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            })
            if (!response.ok) return

            const fresh = await response.json()
            const byId = Object.fromEntries(fresh.map(part => [part.id, part]))

            setCart(prev => prev.map(item => {
                const part = byId[item.partId]
                if (!part) return { ...item, unavailable: true }

                const stock = part.quantityOnHand ?? 0
                if (stock <= 0 || part.price === null || part.price === undefined) {
                    return { ...item, unavailable: true }
                }

                return {
                    partId: item.partId,
                    partNumber: part.partNumber,
                    description: part.description,
                    price: part.price,
                    wholesalePrice: part.wholesalePrice,
                    coreCharge: part.coreCharge,
                    quantityOnHand: stock,
                    quantity: Math.min(item.quantity, stock),
                    notice: item.quantity > stock ? `Only ${stock} in stock, so we lowered your quantity.` : undefined
                }
            }))
        } catch {
            // Network problem: keep showing what we have. The server re-prices at checkout anyway.
        }
    }, [])

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{ cart, isLoaded, addToCart, removeFromCart, updateQuantity, clearCart, refreshPrices, itemCount }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
