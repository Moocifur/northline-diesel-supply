import { Monitor, Server, Shield, Github } from 'lucide-react'
import { SITE } from '@/lib/site'

const parts = [
    {
        title: 'Storefront',
        icon: <Monitor className="w-6 h-6" />,
        text: 'Next.js (App Router) with a backend-for-frontend layer. The login token lives in an httpOnly cookie that browser JavaScript can never read.'
    },
    {
        title: 'API',
        icon: <Server className="w-6 h-6" />,
        text: 'Express and Prisma on PostgreSQL. Prices, stock and permissions are decided here and never trusted from the browser.'
    },
    {
        title: 'Admin panel',
        icon: <Shield className="w-6 h-6" />,
        text: 'A separate React + Vite app for parts, users and orders. It talks to the same API and only lets admins in.'
    }
]

const stack = ['Next.js', 'React', 'Express', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'Vite']

const TechStack = () => {
    return (
        <section id="about" className="py-20 bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-start">

                    <div>
                        <h2 className="text-4xl font-bold mb-6">Under the Hood</h2>

                        <div className="space-y-6">
                            {parts.map((part) => (
                                <div key={part.title} className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                        {part.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{part.title}</h3>
                                        <p className="text-gray-400">{part.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl">
                        <div className="bg-gray-800 p-6 rounded-xl">
                            <h3 className="text-2xl font-bold mb-4 text-center">Built With</h3>

                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {stack.map((tech) => (
                                    <span key={tech} className="px-3 py-1 rounded-full bg-gray-900 text-sm text-gray-300">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <p className="text-gray-400 text-center mb-6">
                                The full source, with an architecture walkthrough, is on GitHub.
                            </p>

                            <div className="text-center">
                                <a
                                    href={SITE.repoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    <Github className="w-5 h-5" />
                                    View the code
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default TechStack
