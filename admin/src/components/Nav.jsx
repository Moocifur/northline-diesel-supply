import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Package, Users as UsersIcon, ClipboardList } from 'lucide-react'
import { logout } from '../api/auth'

function Nav() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <nav className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto">
                <span className="hidden sm:inline font-bold text-lg whitespace-nowrap">Northline Admin</span>
                <Link to="/parts" className="flex items-center gap-2 hover:text-blue-400 transition-colors whitespace-nowrap">
                    <Package className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Parts</span>
                </Link>
                <Link to="/users" className="flex items-center gap-2 hover:text-blue-400 transition-colors whitespace-nowrap">
                    <UsersIcon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Users</span>
                </Link>
                <Link to="/orders" className="flex items-center gap-2 hover:text-blue-400 transition-colors whitespace-nowrap">
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Orders</span>
                </Link>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors shrink-0">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
            </button>
        </nav>
    )
}

export default Nav
