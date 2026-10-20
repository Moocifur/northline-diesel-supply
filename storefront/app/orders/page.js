import Link from 'next/link'
import { cookies } from 'next/headers'
import { CheckCircle } from 'lucide-react'
import { fetchMe, fetchMyOrders } from '@/lib/api'
import CoreChargeInfo from '../components/CoreChargeInfo'
import { money } from '@/lib/format'
import WholesaleRequestButton from '../components/WholesaleRequestButton'

const CORE_STATUS_LABELS = {
    PENDING: 'Core Return Pending',
    RETURNED: 'Core Received — Awaiting Inspection',
    INSPECTED: 'Core Inspected',
    REFUNDED: 'Core Refunded',
    REJECTED: 'Core Rejected'
}

const CORE_STATUS_COLORS = {
    PENDING: 'text-yellow-400',
    RETURNED: 'text-blue-400',
    INSPECTED: 'text-blue-400',
    REFUNDED: 'text-green-400',
    REJECTED: 'text-red-400'
}

const ORDER_STATUS_LABELS = {
    PENDING_PAYMENT: 'Awaiting Payment',
    PAID: 'Paid',
    FULFILLED: 'Fulfilled',
    CANCELLED: 'Cancelled'
}

const ORDER_STATUS_COLORS = {
    PENDING_PAYMENT: 'text-yellow-400',
    PAID: 'text-blue-400',
    FULFILLED: 'text-green-400',
    CANCELLED: 'text-gray-500'
}

function WholesaleStatusCard({ status }) {
    if (status === 'PENDING') {
        return (
            <div className="bg-yellow-900/40 border border-yellow-700 rounded-xl p-6 mb-8 text-sm text-yellow-300">
                Your wholesale pricing request is pending review.
            </div>
        )
    }

    if (status === 'APPROVED') {
        return (
            <div className="bg-green-900/40 border border-green-700 rounded-xl p-6 mb-8 text-sm text-green-300">
                You&apos;re approved for wholesale pricing.
            </div>
        )
    }

    return (
        <div className="bg-gray-800 rounded-xl p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
                <div className="font-semibold mb-1">Wholesale Pricing</div>
                <div className="text-sm text-gray-400">Businesses can apply for wholesale pricing on eligible parts.</div>
            </div>
            <WholesaleRequestButton />
        </div>
    )
}

export default async function OrdersPage({ searchParams }) {
    const params = await searchParams
    const justOrdered = params?.success === '1'

    const cookieStore = await cookies()
    const isLoggedIn = !!cookieStore.get('token')?.value

    if (!isLoggedIn) {
        return (
            <main className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-2xl font-bold mb-4">Log in to see your order history</h1>
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Log In
                    </Link>
                </div>
            </main>
        )
    }

    const me = await fetchMe()
    const orders = await fetchMyOrders()

    if (orders.length === 0) {
        return (
            <main className="py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <WholesaleStatusCard status={me.wholesaleStatus} />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">You haven&apos;t placed any orders yet</h1>
                        <Link href="/parts" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Browse the catalog
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                {justOrdered && (
                    <div className="mb-8 p-4 bg-green-900 border border-green-600 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-300">Your order was placed successfully!</span>
                    </div>
                )}

                <WholesaleStatusCard status={me.wholesaleStatus} />

                <h1 className="text-4xl font-bold mb-10 text-center">Order History</h1>
                <div className="space-y-6">
                    {orders.map(order => {
                        const isCancelled = order.status === 'CANCELLED'
                        const hasCoreCharge = !isCancelled && order.items.some(item => item.coreCharge)
                        return (
                            <div key={order.id} className="bg-gray-800 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-sm text-gray-400">Order #{order.id.slice(-8)}</div>
                                        <div className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">${money(order.total)}</div>
                                        <div className={`text-sm ${ORDER_STATUS_COLORS[order.status] ?? 'text-gray-400'}`}>
                                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-700 border-t border-gray-700 mb-4">
                                    {order.items.map(item => (
                                        <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-sm text-blue-400 font-semibold">{item.partNumber}</div>
                                                <div>{item.description}</div>
                                                <div className="text-sm text-gray-400">Qty: {item.quantity} × ${money(item.unitPrice)}</div>
                                            </div>
                                            {item.coreCharge && !isCancelled && (
                                                <div className="text-right text-sm">
                                                    <div className="text-gray-400">Core charge: ${money(item.coreCharge)}</div>
                                                    <div className={CORE_STATUS_COLORS[item.coreStatus]}>
                                                        {CORE_STATUS_LABELS[item.coreStatus]}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {hasCoreCharge && <CoreChargeInfo />}
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
