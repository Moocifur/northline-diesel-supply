import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import Logo from './Logo'
import { SITE } from '@/lib/site'

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Logo className="w-10 h-10" />
              <div>
                <h3 className="font-bold">{SITE.name}</h3>
                <p className="text-xs text-gray-400">{SITE.tagline}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              A fictional business used to demonstrate a full-stack parts store. Nothing here is for sale.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/parts" className="hover:text-blue-400 transition-colors">Parts Catalog</Link></li>
              <li><Link href="/cart" className="hover:text-blue-400 transition-colors">Cart</Link></li>
              <li><Link href="/orders" className="hover:text-blue-400 transition-colors">My Orders</Link></li>
              <li><Link href="/register" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">The Project</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/#features" className="hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link href="/#about" className="hover:text-blue-400 transition-colors">Under the Hood</Link></li>
              <li><a href={SITE.repoUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">Source Code</a></li>
              <li><Link href="/#contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href={SITE.phoneHref} className="hover:text-blue-400 transition-colors">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{SITE.email}</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  {SITE.address.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; 2026 {SITE.name} (fictional demo). Built by{' '}
            <a href={SITE.author.url} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
              {SITE.author.name}
            </a>.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
