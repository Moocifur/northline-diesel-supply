import { useState, useEffect } from 'react'
import { DollarSign, ShieldCheck, ShieldOff } from 'lucide-react'
import Nav from '../components/Nav'
import { getUsers, approveWholesale, revokeWholesale, setWholesaleDiscount, makeAdmin, removeAdmin } from '../api/users'

const DOT_COLORS = {
    APPROVED: 'bg-green-400',
    PENDING: 'bg-yellow-400',
    NONE: 'bg-gray-500'
}

const DISCOUNT_OPTIONS = [0, 10, 20, 30]

function Users() {
    const [users, setUsers] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        getUsers()
            .then(data => setUsers(data))
            .catch(err => setError(err.message))
    }, [])

    const handleToggleWholesale = async (user) => {
        setError('')
        try {
            const updated = user.wholesaleStatus === 'APPROVED'
                ? await revokeWholesale(user.id)
                : await approveWholesale(user.id)
            setUsers(users.map(u => u.id === user.id ? updated : u))
        } catch (err) {
            setError(err.message)
        }
    }

    const handleToggleAdmin = async (user) => {
        setError('')
        try {
            const updated = user.isAdmin
                ? await removeAdmin(user.id)
                : await makeAdmin(user.id)
            setUsers(users.map(u => u.id === user.id ? updated : u))
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDiscountChange = async (user, discountPercent) => {
        setError('')
        try {
            const updated = await setWholesaleDiscount(user.id, discountPercent)
            setUsers(users.map(u => u.id === user.id ? updated : u))
        } catch (err) {
            setError(err.message)
        }
    }

    const actionButtonClass = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
    const selectClass = "text-xs bg-gray-900 border border-gray-600 rounded-lg px-2 py-1.5 text-gray-300"

    const StatusDot = ({ user }) => (
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${DOT_COLORS[user.wholesaleStatus]}`} />
                Wholesale: {user.wholesaleStatus}
            </div>
            {!user.isOwner && (
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${user.isAdmin ? 'bg-blue-400' : 'bg-gray-500'}`} />
                    {user.isAdmin ? 'Admin' : 'Not Admin'}
                </div>
            )}
        </div>
    )

    const Actions = ({ user }) => (
        <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => handleToggleWholesale(user)} className={actionButtonClass}>
                <DollarSign className="w-3.5 h-3.5" />
                {user.wholesaleStatus === 'APPROVED' ? 'Revoke Wholesale' : 'Approve Wholesale'}
            </button>
            <select
                value={user.wholesaleDiscountPercent}
                onChange={(e) => handleDiscountChange(user, Number(e.target.value))}
                className={selectClass}
            >
                {DISCOUNT_OPTIONS.map(percent => (
                    <option key={percent} value={percent}>{percent}% off</option>
                ))}
            </select>
            {!user.isOwner && (
                <button onClick={() => handleToggleAdmin(user)} className={actionButtonClass}>
                    {user.isAdmin ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                </button>
            )}
        </div>
    )

    return (
        <div>
            <Nav />
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6">Users</h1>
                {error && <p className="text-red-400 mb-4">{error}</p>}

                {/* Card layout — small screens only */}
                <div className="md:hidden space-y-4">
                    {users.map(user => (
                        <div key={user.id} className="bg-gray-800 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <div className="font-semibold">{user.name}</div>
                                    <div className="text-sm text-gray-400">{user.email}</div>
                                    {user.company && <div className="text-sm text-gray-400">{user.company}</div>}
                                </div>
                                {user.isOwner && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-900 text-purple-300 shrink-0">Owner</span>
                                )}
                            </div>

                            <div className="mb-4">
                                <StatusDot user={user} />
                            </div>

                            <Actions user={user} />
                        </div>
                    ))}
                </div>

                {/* Table layout — md and up */}
                <div className="hidden md:block bg-gray-800 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700 text-sm text-gray-300">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Company</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3">{user.name}</td>
                                    <td className="px-4 py-3 text-gray-400">{user.email}</td>
                                    <td className="px-4 py-3 text-gray-400">{user.company ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <StatusDot user={user} />
                                            {user.isOwner && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-purple-900 text-purple-300">Owner</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Actions user={user} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Users
