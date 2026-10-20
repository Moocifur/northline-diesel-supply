import { Fuel } from 'lucide-react'

// A simple icon logo, so the project ships no brand artwork of its own to maintain.
export default function Logo({ className = 'w-12 h-12' }) {
    return (
        <span className={`${className} rounded-lg bg-blue-600 flex items-center justify-center shrink-0`}>
            <Fuel className="w-3/5 h-3/5 text-white" />
        </span>
    )
}
