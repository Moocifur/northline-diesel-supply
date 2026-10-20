import { useState, useEffect, useCallback } from 'react'
import { getParts, updatePart, deletePart } from '../api/parts'
import Nav from '../components/Nav'
import AddPartForm from '../components/AddPartForm'
import { money } from '../lib/format'
import { Pencil, Trash2, Check, X, Power, PowerOff, Package, ChevronLeft, ChevronRight, Search } from 'lucide-react'

const PAGE_SIZE = 50

// Red when sold out, yellow when running low, so stock problems stand out in the list.
const stockClass = (part) => {
    const stock = part.quantityOnHand ?? 0
    if (stock === 0) return 'text-red-400 font-semibold'
    if (stock <= 5) return 'text-yellow-400'
    return 'text-gray-400'
}

function Parts() {
    const [parts, setParts] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const loadPage = useCallback((p, s) => {
        getParts(p, PAGE_SIZE, s)
            .then(({ parts, total }) => {
                setParts(parts)
                setTotal(total)
            })
            .catch(err => setError(err.message))
    }, [])

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(timeout)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    useEffect(() => {
        loadPage(page, debouncedSearch)
    }, [page, debouncedSearch, loadPage])

    const handlePartAdded = () => {
        loadPage(page, debouncedSearch)
    }

    const handleEditClick = (part) => {
        setEditingId(part.id)
        setEditForm({
            partNumber: part.partNumber,
            description: part.description,
            brand: part.brand,
            category: part.category,
            price: part.price ?? '',
            coreCharge: part.coreCharge ?? '',
            quantityOnHand: part.quantityOnHand ?? 0,
            imageUrl: part.images?.[0] ?? ''
        })
    }

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value })
    }

    const handleEditSave = async (id) => {
        try {
            const { imageUrl, ...rest } = editForm
            await updatePart(id, { ...rest, images: imageUrl ? [imageUrl] : [] })
            setEditingId(null)
            loadPage(page, debouncedSearch)
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDelete = async (id) => {
        try {
            await deletePart(id)
            loadPage(page, debouncedSearch)
        } catch (err) {
            setError(err.message)
        }
    }

    const handleToggleActive = async (part) => {
        try {
            await updatePart(part.id, { active: !part.active })
            loadPage(page, debouncedSearch)
        } catch (err) {
            setError(err.message)
        }
    }

    const cellInputClass = "w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white"
    const actionButtonClass = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 transition-colors"

    const EDIT_FIELDS = [
        { name: 'partNumber', label: 'Part Number' },
        { name: 'description', label: 'Description' },
        { name: 'brand', label: 'Brand' },
        { name: 'category', label: 'Category' },
        { name: 'price', label: 'Price' },
        { name: 'coreCharge', label: 'Core Charge' },
        { name: 'quantityOnHand', label: 'Quantity On Hand' },
        { name: 'imageUrl', label: 'Image URL' }
    ]

    const Thumbnail = ({ part, size = 'w-12 h-12' }) => (
        part.images?.[0] ? (
            <img src={part.images[0]} alt={part.partNumber} className={`${size} rounded-lg object-cover shrink-0`} />
        ) : (
            <div className={`${size} rounded-lg bg-gray-700 flex items-center justify-center shrink-0`}>
                <Package className="w-5 h-5 text-gray-500" />
            </div>
        )
    )

    return (
        <div>
            <Nav/>
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6">Parts</h1>
                {error && <p className="text-red-400 mb-4">{error}</p>}
                <AddPartForm onPartAdded={handlePartAdded} />

                <div className="relative mb-4">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by part number, description, or brand..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
                    />
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-300">
                    <span>{total} parts total</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Card layout — small screens only */}
                <div className="md:hidden space-y-4">
                    {parts.map(part => (
                        <div key={part.id} className={`bg-gray-800 rounded-xl p-4 ${part.active ? '' : 'opacity-60'}`}>
                            {editingId === part.id ? (
                                <div className="space-y-3">
                                    {EDIT_FIELDS.map(field => (
                                        <div key={field.name}>
                                            <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
                                            <input
                                                name={field.name}
                                                value={editForm[field.name]}
                                                onChange={handleEditChange}
                                                className={cellInputClass}
                                            />
                                        </div>
                                    ))}
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => handleEditSave(part.id)} className={`${actionButtonClass} hover:border-green-500 hover:text-green-400`}>
                                            <Check className="w-3.5 h-3.5" />
                                            Save
                                        </button>
                                        <button onClick={() => setEditingId(null)} className={`${actionButtonClass} hover:border-gray-400`}>
                                            <X className="w-3.5 h-3.5" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-start gap-3">
                                            <Thumbnail part={part} />
                                            <div>
                                                <div className="text-sm text-blue-400 font-semibold">{part.partNumber}</div>
                                                <div className="font-semibold">{part.description}</div>
                                                <div className="text-sm text-gray-400">{part.brand} · {part.category}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-300 shrink-0">
                                            <span className={`w-2 h-2 rounded-full ${part.active ? 'bg-green-400' : 'bg-gray-500'}`} />
                                            {part.active ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300 mb-3">
                                        <div>Price: <span className="text-white font-medium">{money(part.price)}</span></div>
                                        <div>Core: <span className="text-white font-medium">{money(part.coreCharge)}</span></div>
                                        <div>Qty: <span className={`font-medium ${stockClass(part)}`}>{part.quantityOnHand ?? 0}</span></div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => handleEditClick(part)} className={`${actionButtonClass} hover:border-blue-500 hover:text-blue-400`}>
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button onClick={() => handleToggleActive(part)} className={`${actionButtonClass} hover:border-yellow-500 hover:text-yellow-400`}>
                                            {part.active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                            {part.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => handleDelete(part.id)} className={`${actionButtonClass} hover:border-red-500 hover:text-red-400`}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Table layout — md and up */}
                <div className="hidden md:block bg-gray-800 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700 text-sm text-gray-300">
                            <tr>
                                <th className="px-4 py-3">Image</th>
                                <th className="px-4 py-3">Part Number</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Brand</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Core Charge</th>
                                <th className="px-4 py-3">Qty</th>
                                <th className="px-4 py-3">Active</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {parts.map(part => (
                                <tr key={part.id} className={`hover:bg-gray-700/50 transition-colors ${part.active ? '' : 'opacity-60'}`}>
                                    {editingId === part.id ? (
                                        <>
                                            <td className="px-4 py-2"><input name="imageUrl" placeholder="Image URL" value={editForm.imageUrl} onChange={handleEditChange} className={cellInputClass} /></td>
                                            <td className="px-4 py-2"><input name="partNumber" value={editForm.partNumber} onChange={handleEditChange} className={cellInputClass} /></td>
                                            <td className="px-4 py-2"><input name="description" value={editForm.description} onChange={handleEditChange} className={cellInputClass} /></td>
                                            <td className="px-4 py-2"><input name="brand" value={editForm.brand} onChange={handleEditChange} className={cellInputClass} /></td>
                                            <td className="px-4 py-2"><input name="category" value={editForm.category} onChange={handleEditChange} className={cellInputClass} /></td>
                                            <td className="px-4 py-2"><input name="price" value={editForm.price} onChange={handleEditChange} className={cellInputClass} /></td>
                                            <td className="px-4 py-2"><input name="coreCharge" value={editForm.coreCharge} onChange={handleEditChange} className={cellInputClass} /></td>
                                            <td className="px-4 py-2"><input name="quantityOnHand" type="number" min="0" value={editForm.quantityOnHand} onChange={handleEditChange} className={cellInputClass} /></td>
                                            <td className="px-4 py-2">{part.active ? 'Yes' : 'No'}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditSave(part.id)} className="text-green-400 hover:text-green-300">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3"><Thumbnail part={part} size="w-10 h-10" /></td>
                                            <td className="px-4 py-3 text-blue-400 font-medium">{part.partNumber}</td>
                                            <td className="px-4 py-3">{part.description}</td>
                                            <td className="px-4 py-3 text-gray-400">{part.brand}</td>
                                            <td className="px-4 py-3 text-gray-400">{part.category}</td>
                                            <td className="px-4 py-3">{money(part.price)}</td>
                                            <td className="px-4 py-3 text-gray-400">{money(part.coreCharge)}</td>
                                            <td className={`px-4 py-3 ${stockClass(part)}`}>{part.quantityOnHand ?? 0}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <span className={`w-2 h-2 rounded-full ${part.active ? 'bg-green-400' : 'bg-gray-500'}`} />
                                                    {part.active ? 'Yes' : 'No'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleEditClick(part)} className="text-blue-400 hover:text-blue-300">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleToggleActive(part)} className="text-yellow-400 hover:text-yellow-300">
                                                        {part.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleDelete(part.id)} className="text-red-400 hover:text-red-300">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Parts
