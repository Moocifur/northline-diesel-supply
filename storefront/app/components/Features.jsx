import { Tag, Package, RefreshCw, CheckCircle } from 'lucide-react'

const features = [
    {
        title: 'Wholesale Pricing',
        description: 'Approved business customers see discounted prices. The discount is calculated on the server, so regular visitors never receive wholesale numbers.',
        icon: <Tag className="w-8 h-8" />,
        points: ['Request and approval flow', 'Per-customer discount', 'Calculated server-side', 'Shown in cart and orders']
    },
    {
        title: 'Live Inventory',
        description: 'Stock is checked and claimed in a single database transaction when an order is placed, so the last unit can never be sold twice.',
        icon: <Package className="w-8 h-8" />,
        points: ['Low and out-of-stock labels', 'Atomic stock claims', 'Cancelling restocks parts', 'Supplier stock feed (CSV)']
    },
    {
        title: 'Core Charges',
        description: 'Rebuildable parts carry a refundable core charge. Each one is tracked from pending to refunded in the admin panel.',
        icon: <RefreshCw className="w-8 h-8" />,
        points: ['Per-part core charge', 'Return tracking', 'Status visible to customers', 'Refund workflow']
    }
]

const Features = () => {
    return (
        <section id="features" className="py-20 bg-gray-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">What This Demo Shows</h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        The business rules a real parts shop needs, not just a pretty catalog
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div key={feature.title} className="bg-gray-900 p-8 rounded-xl hover:bg-gray-700 transition-colors group">
                            <div className="text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>

                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-gray-400 mb-6">{feature.description}</p>

                            <ul className="space-y-2">
                                {feature.points.map((point) => (
                                    <li key={point} className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
