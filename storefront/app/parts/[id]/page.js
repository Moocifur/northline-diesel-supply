import Link from 'next/link'
import { Package } from 'lucide-react'
import { fetchPart } from '@/lib/api'
import { money, availability } from '@/lib/format'
import AddToCartButton from '../../components/AddToCartButton'

export default async function PartPage({ params }) {
    const { id } = await params
    const part = await fetchPart(id)
    const stock = availability(part)
    const discountPercent = part.wholesalePrice
        ? Math.round((1 - Number(part.wholesalePrice) / Number(part.price)) * 100)
        : null

    return (
        <main className="py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/parts" className="text-blue-400 hover:text-blue-300 transition-colors inline-block mb-8">
                    ← Back to catalog
                </Link>

                <div className="bg-gray-800 rounded-xl p-8">
                    {part.images?.[0] ? (
                        <img src={part.images[0]} alt={part.description} className="w-full h-64 object-cover rounded-lg mb-6" />
                    ) : (
                        <div className="w-full h-64 bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-600" />
                        </div>
                    )}
                    <div className="text-sm text-blue-400 font-semibold mb-2">{part.partNumber}</div>
                    <h1 className="text-3xl font-bold mb-6">{part.description}</h1>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6 text-gray-300">
                        <p><span className="text-gray-400">Brand:</span> {part.brand}</p>
                        <p><span className="text-gray-400">Category:</span> {part.category}</p>
                        {part.weight && <p><span className="text-gray-400">Weight:</span> {part.weight} lbs</p>}
                        <p><span className="text-gray-400">Availability:</span> <span className={stock.tone}>{stock.label}</span></p>
                    </div>

                    <div className="border-t border-gray-700 pt-6 space-y-2 mb-6">
                        {part.price && <p className="text-2xl font-bold">${money(part.price)}</p>}
                        {part.wholesalePrice && (
                            <p className="text-gray-400">
                                Wholesale Price: ${money(part.wholesalePrice)}{' '}
                                <span className="text-green-400 font-semibold">({discountPercent}% off)</span>
                            </p>
                        )}
                        {part.coreCharge && <p className="text-gray-400">Core Charge: ${money(part.coreCharge)}</p>}
                    </div>

                    <AddToCartButton part={part} />
                </div>
            </div>
        </main>
    )
}
