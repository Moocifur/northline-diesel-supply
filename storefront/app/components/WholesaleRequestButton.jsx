'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WholesaleRequestButton() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleClick = async () => {
        setError('')
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/wholesale-request', { method: 'PUT' })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit request')
            }

            router.refresh()
        } catch (err) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <button
                onClick={handleClick}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold transition-colors text-sm whitespace-nowrap"
            >
                {isSubmitting ? 'Submitting...' : 'Request Wholesale Pricing'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    )
}
