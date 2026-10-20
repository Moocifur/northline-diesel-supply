import Link from 'next/link'
import { Package, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { fetchParts } from '@/lib/api'
import { money, availability } from '@/lib/format'
import AddToCartButton from '../components/AddToCartButton'

const PAGE_SIZE = 24

function Pagination({ page, totalPages, query }) {
  const hrefFor = (p) => `/parts?page=${p}${query ? `&q=${encodeURIComponent(query)}` : ''}`

  return (
    <div className="flex items-center justify-center gap-4 text-sm">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-800 text-gray-600 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Prev
        </span>
      )}
      <span className="text-gray-400">Page {page} of {totalPages}</span>
      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-800 text-gray-600 cursor-not-allowed">
          Next
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  )
}

export default async function PartsPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page) || 1)
  const query = params?.q || ''
  const { parts, total } = await fetchParts(page, PAGE_SIZE, query)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main className="py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-10 text-center">Parts Catalog</h1>

        <form method="GET" action="/parts" className="relative max-w-xl mx-auto mb-10">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by part number, description, or brand..."
            className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
          />
        </form>

        {parts.length === 0 && (
          <p className="text-center text-gray-400 mb-10">No parts found{query ? ` for "${query}"` : ''}.</p>
        )}

        {totalPages > 1 && (
          <div className="mb-8">
            <Pagination page={page} totalPages={totalPages} query={query} />
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parts.map(part => {
            const discountPercent = part.wholesalePrice
              ? Math.round((1 - Number(part.wholesalePrice) / Number(part.price)) * 100)
              : null

            const stock = availability(part)

            return (
            <div key={part.id} className="bg-gray-800 hover:bg-gray-700 transition-colors rounded-xl p-6 flex flex-col">
              <Link href={`/parts/${part.id}`} className="block mb-4">
                {part.images?.[0] ? (
                  <img src={part.images[0]} alt={part.description} className="w-full h-40 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="w-full h-40 bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                <div className="text-sm text-blue-400 font-semibold mb-1">{part.partNumber}</div>
                <div className="text-lg font-semibold mb-2">{part.description}</div>
                <div className="text-sm text-gray-400">{part.brand}</div>
                <div className={`text-xs mt-1 ${stock.tone}`}>{stock.label}</div>
              </Link>
              <div className="mt-auto flex items-center justify-between gap-4">
                <div>
                  {part.price && <div className="text-xl font-bold">${money(part.price)}</div>}
                  {part.wholesalePrice && (
                    <div className="text-xs text-gray-400">
                      Wholesale: ${money(part.wholesalePrice)}{' '}
                      <span className="text-green-400 font-semibold">({discountPercent}% off)</span>
                    </div>
                  )}
                </div>
                <AddToCartButton part={part} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-3 py-2 text-sm" />
              </div>
            </div>
            )
          })}
        </div>

        <div className="mt-12">
          <Pagination page={page} totalPages={totalPages} query={query} />
        </div>
      </div>
    </main>
  )
}
