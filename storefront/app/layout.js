import { cookies } from 'next/headers'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { CartProvider } from './context/CartContext'
import { fetchMe } from '@/lib/api'
import { SITE } from '@/lib/site'
import DemoBanner from './components/DemoBanner'

export const metadata = {
  title: `${SITE.name} (demo)`,
  description: 'A full-stack demo parts store with wholesale pricing, live inventory and an admin panel. A fictional business built for a portfolio.',
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies()
  const hasToken = !!cookieStore.get('token')?.value

  let user = null
  if (hasToken) {
    try {
      user = await fetchMe()
    } catch {
      user = null
    }
  }

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <CartProvider>
          <DemoBanner />
          <Header user={user} />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
