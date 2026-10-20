import { Info } from 'lucide-react'
import { SITE } from '@/lib/site'

export default function CoreChargeInfo() {
    return (
        <div className="bg-blue-950/40 border border-blue-800 rounded-lg p-4 flex gap-3 text-sm text-gray-300">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
                <p className="font-semibold text-blue-300 mb-1">About Core Charges</p>
                <p>
                    Some parts include a refundable core charge. Ship your old part back to us at{' '}
                    <span className="text-white">{SITE.address.join(', ')}</span> within 30 days of your order.
                    Once we receive and inspect it, your core charge will be refunded.
                </p>
            </div>
        </div>
    )
}
