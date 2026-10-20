// Everything about the fictional business in one place. Change the name here and it changes
// across the whole storefront. None of these details are real.
export const SITE = {
    name: 'Northline Diesel Supply',
    tagline: 'Demo parts store',
    phone: '(555) 010-0142',
    phoneHref: 'tel:+15550100142',
    email: 'hello@example.com',
    address: ['100 Demo Street', 'Anytown, USA 00000'],
    hours: 'Mon-Fri 7AM-5PM',
    repoUrl: 'https://github.com/Moocifur/dis-shop',
    // Set NEXT_PUBLIC_ADMIN_URL in the storefront's environment to link the deployed admin panel.
    adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || '',
    author: { name: 'David Tran', url: 'https://davidtran.netlify.app' }
}

// Public on purpose. These are created by api/prisma/seed.js and shown on the login page.
export const DEMO_ACCOUNTS = [
    { role: 'Wholesale customer', note: 'Sees 20% off wholesale prices', email: 'wholesale@example.com', password: 'demo-wholesale-123' },
    { role: 'Regular customer', note: 'Sees regular prices', email: 'customer@example.com', password: 'demo-customer-123' },
    { role: 'Admin', note: 'Manages the store in the admin panel', email: 'admin@example.com', password: 'demo-admin-123' }
]
