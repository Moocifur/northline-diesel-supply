import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { SITE } from '@/lib/site'

const steps = [
    'Browse the catalog and search by part number.',
    'Log in as the wholesale demo customer to see discounted prices.',
    'Add parts to your cart and place an order. No payment needed.',
    'Open the admin panel to fulfil or cancel the order and track core returns.'
]

const Hero = () => {
    return (
        <section id="home" className="relative py-20 bg-gradient-to-b from-gray-800 to-gray-900">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Sparkles className="w-6 h-6 text-yellow-500" />
                            <span className="text-yellow-500 font-semibold">Portfolio demo • Not a real business</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            A parts store that <span className="text-blue-400">actually works</span>
                        </h1>

                        <p className="text-xl text-gray-300 mb-8">
                            {SITE.name} is made up, but the store behind it is real: wholesale pricing, live
                            inventory, core charge tracking and an admin panel, all wired to a real database.
                        </p>

                        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 mb-4">
                            <Link href="/parts" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors text-center sm:flex-1">
                                Shop Parts
                            </Link>

                            <a href="#features" className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors text-center sm:flex-1">
                                See Features
                            </a>
                        </div>

                        <Link href="/login" className="border-2 border-white hover:border-blue-400 hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all text-center block sm:max-w-xs shadow-lg">
                            Log in as a demo user
                        </Link>
                    </div>

                    <div className="relative">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl">
                            <div className="bg-gray-800 p-6 rounded-xl">
                                <h3 className="text-2xl font-bold mb-4">Try it yourself</h3>
                                <ol className="space-y-4">
                                    {steps.map((step, index) => (
                                        <li key={step} className="flex items-start gap-3">
                                            <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-300">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                                {SITE.adminUrl && (
                                    <a href={SITE.adminUrl} target="_blank" rel="noreferrer" className="inline-block mt-6 text-blue-400 hover:text-blue-300 transition-colors">
                                        Open the admin panel →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
