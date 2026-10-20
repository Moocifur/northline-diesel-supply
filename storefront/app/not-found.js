import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="py-20">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold mb-4">Page not found</h1>
                <p className="text-gray-400 mb-6">That part or page does not exist, or is no longer available.</p>
                <Link href="/parts" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Browse the catalog
                </Link>
            </div>
        </main>
    )
}
