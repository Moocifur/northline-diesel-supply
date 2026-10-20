'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { availability } from '@/lib/format'

export default function AddToCartButton({ part, className = '', iconOnly = false }) {
    const { addToCart } = useCart()
    const { canBuy, label } = availability(part)

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addToCart(part)
            }}
            disabled={!canBuy}
            aria-label={canBuy ? 'Add to Cart' : label}
            className={`flex items-center justify-center gap-2 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${className || 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2'}`}
        >
            <ShoppingCart className="w-4 h-4" />
            {!iconOnly && <span>{canBuy ? 'Add to Cart' : label}</span>}
        </button>
    )
}
