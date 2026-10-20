// Demo data for the shop: a fictional catalog, four demo accounts and a few sample orders.
//
//   npm run db:seed --workspace=api              seed a LOCAL database
//   npm run db:seed --workspace=api -- --remote  seed a hosted database (e.g. the Render demo DB)
//
// WARNING: this DELETES every part, user and order first, so it can be re-run any time to reset
// the demo. Because of that, it refuses to touch a non-local database unless you pass --remote.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/middleware/prisma');
const { buildOrderLines } = require('../src/services/pricing');

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', '[::1]'];

const assertSafeTarget = () => {
    let host = '';
    try {
        host = new URL(process.env.DATABASE_URL || '').hostname;
    } catch {
        // fall through: an unparseable URL is treated as "not local"
    }
    if (!LOCAL_HOSTS.includes(host) && !process.argv.includes('--remote')) {
        console.error(`Refusing to wipe a database on "${host || 'unknown host'}".`);
        console.error('This script deletes all data. If that really is your demo database, run it again with --remote.');
        process.exit(1);
    }
};

// ---- demo accounts (these are public on purpose: they are shown on the login pages) ----
const DEMO_USERS = [
    { email: 'admin@example.com', password: 'demo-admin-123', name: 'Demo Admin', company: 'Northline Diesel Supply', isAdmin: true, isOwner: true },
    { email: 'wholesale@example.com', password: 'demo-wholesale-123', name: 'Riley Wholesale', company: 'Riverside Fleet Services', wholesaleStatus: 'APPROVED', wholesaleDiscountPercent: 20 },
    { email: 'customer@example.com', password: 'demo-customer-123', name: 'Casey Customer' },
    { email: 'applicant@example.com', password: 'demo-applicant-123', name: 'Pat Applicant', company: 'Pat\'s Truck Repair', wholesaleStatus: 'PENDING' }
];

// ---- fictional catalog: [description, price, core charge or null] ----
const CATEGORIES = [
    { name: 'Fuel Injectors', prefix: 'INJ', items: [
        ['Common Rail Fuel Injector, 6.6L V8', 389.00, 75],
        ['Common Rail Fuel Injector, 6.7L Inline-6', 342.50, 75],
        ['Unit Injector, 7.3L V8', 214.00, 60],
        ['Piezo Fuel Injector, 3.0L V6', 455.00, 90],
        ['Injector Nozzle Set (4), Mechanical Pump', 96.80, null],
        ['Injector Rebuild Kit, 5.9L Inline-6', 58.25, null]
    ] },
    { name: 'Injection Pumps', prefix: 'PMP', items: [
        ['High-Pressure Fuel Pump, 6.6L V8', 645.00, 150],
        ['Rotary Injection Pump, 4-Cylinder', 710.00, 200],
        ['Lift Pump Assembly, 7.3L V8', 132.40, null],
        ['Fuel Transfer Pump, 12V', 74.99, null],
        ['Pump Drive Gear Kit', 39.50, null],
        ['Rotary Pump Rebuild Kit', 88.00, null]
    ] },
    { name: 'Turbochargers', prefix: 'TRB', items: [
        ['Variable Geometry Turbocharger, 6.7L', 1189.00, 250],
        ['Fixed Geometry Turbocharger, 5.9L', 764.00, 180],
        ['Electronic Turbo Actuator', 215.40, 40],
        ['Turbo Gasket & Install Kit', 42.95, null],
        ['Turbo Oil Feed Line', 36.20, null],
        ['Intercooler Boot Kit', 61.75, null]
    ] },
    { name: 'Filters', prefix: 'FLT', items: [
        ['Fuel Filter / Water Separator Element', 24.50, null],
        ['Spin-On Fuel Filter, Primary', 18.75, null],
        ['Heavy-Duty Engine Oil Filter', 14.20, null],
        ['Engine Air Filter Element', 38.90, null],
        ['Cabin Air Filter', 17.60, null],
        ['Fuel Filter Housing Cap & Seal', 29.95, null]
    ] },
    { name: 'Gaskets & Seals', prefix: 'GSK', items: [
        ['Valve Cover Gasket Set', 46.80, null],
        ['Head Gasket Set, Multi-Layer Steel', 219.00, null],
        ['Injector O-Ring & Seal Kit', 19.95, null],
        ['Rear Main Seal', 33.40, null],
        ['Oil Pan Gasket', 27.60, null],
        ['Exhaust Manifold Gasket Set', 52.15, null]
    ] },
    { name: 'Sensors', prefix: 'SNS', items: [
        ['Fuel Rail Pressure Sensor', 78.30, null],
        ['Camshaft Position Sensor', 44.90, null],
        ['Crankshaft Position Sensor', 47.25, null],
        ['Exhaust Gas Temperature Sensor', 69.00, null],
        ['Boost Pressure Sensor', 52.40, null],
        ['Coolant Temperature Sensor', 21.80, null]
    ] },
    { name: 'Glow Plugs & Heaters', prefix: 'GLW', items: [
        ['Glow Plug Set, 6.6L V8 (8)', 128.00, null],
        ['Glow Plug Controller Module', 96.50, 35],
        ['Intake Air Heater Element', 58.90, null],
        ['Glow Plug, 6.7L Inline-6 (each)', 17.45, null],
        ['Glow Plug Wiring Harness', 39.75, null],
        ['Glow Plug Relay', 24.30, null]
    ] },
    { name: 'Fuel Lines & Fittings', prefix: 'LNS', items: [
        ['High-Pressure Fuel Line, Cylinder 1', 64.00, null],
        ['High-Pressure Fuel Line Set, 8 piece', 389.00, null],
        ['Fuel Return Line Kit', 45.20, null],
        ['Fuel Hose, 5/16 in. (per foot)', 3.95, null],
        ['Quick-Connect Fitting Set', 22.10, null],
        ['Fuel Tank Sending Unit', 118.60, null]
    ] }
];

const BRANDS = ['Kestrel', 'Ironvale', 'Northgate', 'Halcyon', 'Redstone'];

// Cycles through the catalog so the demo shows healthy, low and zero stock.
const STOCK_CYCLE = [14, 6, 0, 22, 3, 9, 31, 2, 12, 0, 18, 5];

// Two parts are inactive so you can see that the storefront hides them and the admin shows them.
const INACTIVE = new Set(['Intercooler Boot Kit', 'Glow Plug Relay']);

const buildCatalog = () => CATEGORIES.flatMap((category, categoryIndex) =>
    category.items.map(([description, price, core], itemIndex) => {
        const index = categoryIndex * category.items.length + itemIndex;
        return {
            partNumber: `${category.prefix}-${1001 + itemIndex * 7}`,
            description,
            brand: BRANDS[index % BRANDS.length],
            category: category.name,
            price: price.toFixed(2),
            coreCharge: core === null ? null : core.toFixed(2),
            quantityOnHand: STOCK_CYCLE[index % STOCK_CYCLE.length],
            active: !INACTIVE.has(description),
            images: []
        };
    })
);

// ---- sample orders, so the order history and the admin Orders page are not empty ----
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const SAMPLE_ORDERS = [
    { user: 'customer@example.com', status: 'PAID', daysAgo: 1,
        items: [['Common Rail Fuel Injector, 6.6L V8', 2], ['Fuel Filter / Water Separator Element', 1]] },
    { user: 'wholesale@example.com', status: 'FULFILLED', daysAgo: 9,
        items: [['High-Pressure Fuel Pump, 6.6L V8', 1], ['Variable Geometry Turbocharger, 6.7L', 1]],
        coreStatuses: ['REFUNDED', 'RETURNED'] },
    { user: 'wholesale@example.com', status: 'FULFILLED', daysAgo: 21,
        items: [['Fuel Rail Pressure Sensor', 3]] },
    { user: 'customer@example.com', status: 'CANCELLED', daysAgo: 14,
        items: [['Head Gasket Set, Multi-Layer Steel', 2]] }
];

async function main() {
    assertSafeTarget();

    console.log('Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.part.deleteMany();
    await prisma.user.deleteMany();

    console.log('Creating parts...');
    await prisma.part.createMany({ data: buildCatalog() });

    console.log('Creating demo users...');
    const usersByEmail = {};
    for (const { password, ...data } of DEMO_USERS) {
        usersByEmail[data.email] = await prisma.user.create({
            data: { ...data, password: await bcrypt.hash(password, 10) }
        });
    }

    console.log('Creating sample orders...');
    const parts = await prisma.part.findMany();
    const partsByDescription = Object.fromEntries(parts.map(part => [part.description, part]));
    const partsById = Object.fromEntries(parts.map(part => [part.id, part]));

    for (const sample of SAMPLE_ORDERS) {
        const user = usersByEmail[sample.user];
        const items = sample.items.map(([description, quantity]) => {
            const part = partsByDescription[description];
            if (!part) throw new Error(`Sample order refers to an unknown part: ${description}`);
            return { partId: part.id, quantity };
        });

        const pricing = {
            canSeeWholesale: user.wholesaleStatus === 'APPROVED',
            discountPercent: user.wholesaleDiscountPercent
        };
        const { lines, subtotal, coreChargeTotal, total } = buildOrderLines(items, partsById, pricing);

        // Fulfilled orders get a realistic spread of core-return statuses.
        let coreIndex = 0;
        const itemsData = lines.map(line => ({
            ...line,
            coreStatus: line.coreCharge ? (sample.coreStatuses?.[coreIndex++] ?? line.coreStatus) : 'NONE'
        }));

        await prisma.order.create({
            data: {
                userId: user.id,
                status: sample.status,
                subtotal,
                coreChargeTotal,
                total,
                createdAt: daysAgo(sample.daysAgo),
                items: { create: itemsData }
            }
        });

        // Cancelled orders never took stock out of the warehouse.
        if (sample.status !== 'CANCELLED') {
            for (const line of lines) {
                await prisma.part.update({
                    where: { id: line.partId },
                    data: { quantityOnHand: { decrement: line.quantity } }
                });
            }
        }
    }

    console.log(`Done: ${parts.length} parts, ${DEMO_USERS.length} users, ${SAMPLE_ORDERS.length} orders.`);
    console.log('Demo logins:');
    for (const { email, password } of DEMO_USERS) {
        console.log(`  ${email}  /  ${password}`);
    }
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
