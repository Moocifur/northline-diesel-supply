import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { createPart } from '../api/parts'

function AddPartForm({ onPartAdded }) {
    const [isOpen, setIsOpen] = useState(false)
    const [form, setForm] = useState({
        partNumber: '',
        description: '',
        brand: '',
        category: '',
        price: '',
        coreCharge: '',
        quantityOnHand: '',
        imageUrl: ''
    })
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const { imageUrl, ...rest } = form
            const newPart = await createPart({ ...rest, images: imageUrl ? [imageUrl] : [] })
            onPartAdded(newPart)
            setForm({ partNumber: '', description: '', brand: '', category: '', price: '', coreCharge: '', quantityOnHand: '', imageUrl: '' })
            setIsOpen(false)
        } catch (err) {
            setError(err.message)
        }
    }

    const inputClass = "px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white w-full"

    return (
        <div className="bg-gray-800 rounded-xl mb-8 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-700/50 transition-colors"
            >
                <span className="flex items-center gap-2 font-bold text-lg">
                    <Plus className="w-5 h-5" />
                    Add Part
                </span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {isOpen && (
                <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 px-4 sm:px-6 pb-6">
                    <input name="partNumber" placeholder="Part Number" value={form.partNumber} onChange={handleChange} required className={inputClass} />
                    <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required className={inputClass} />
                    <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} required className={inputClass} />
                    <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required className={inputClass} />
                    <input name="price" placeholder="Price" value={form.price} onChange={handleChange} className={inputClass} />
                    <input name="coreCharge" placeholder="Core Charge" value={form.coreCharge} onChange={handleChange} className={inputClass} />
                    <input name="quantityOnHand" placeholder="Quantity On Hand" type="number" min="0" value={form.quantityOnHand} onChange={handleChange} className={inputClass} />
                    <input name="imageUrl" placeholder="Image URL (placeholder — paste a hosted link)" value={form.imageUrl} onChange={handleChange} className={`${inputClass} md:col-span-3`} />
                    {error && <p className="text-red-400 text-sm md:col-span-3">{error}</p>}
                    <button
                        type="submit"
                        className="md:col-span-3 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Part
                    </button>
                </form>
            )}
        </div>
    )
}

export default AddPartForm
