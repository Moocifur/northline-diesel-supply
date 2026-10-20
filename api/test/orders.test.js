// Order-flow tests that run against an in-memory stand-in for the database, so they need
// neither Postgres nor a generated Prisma client. They check the controller's logic (stock
// claiming, rollback, status changes), not Prisma's query syntax.
const test = require('node:test');
const assert = require('node:assert/strict');

// ---- in-memory fake of the parts of the Prisma client the controller uses ----
let parts;
let orders;
let users;

const clone = (value) => structuredClone(value);

const fakePrisma = {
    user: {
        findUnique: async ({ where }) => users[where.id] ?? null
    },
    part: {
        findMany: async ({ where }) => parts.filter(p => where.id.in.includes(p.id)).map(clone),
        updateMany: async ({ where, data }) => {
            const found = parts.find(p => p.id === where.id && p.active === where.active && p.quantityOnHand >= where.quantityOnHand.gte);
            if (!found) return { count: 0 };
            found.quantityOnHand -= data.quantityOnHand.decrement;
            return { count: 1 };
        },
        update: async ({ where, data }) => {
            const found = parts.find(p => p.id === where.id);
            found.quantityOnHand += data.quantityOnHand.increment;
            return clone(found);
        }
    },
    order: {
        create: async ({ data }) => {
            const order = {
                id: `order${orders.length + 1}`,
                userId: data.userId,
                status: data.status,
                subtotal: data.subtotal,
                coreChargeTotal: data.coreChargeTotal,
                total: data.total,
                items: data.items.create.map((item, i) => ({ id: `item${i}`, ...item }))
            };
            orders.push(order);
            return clone(order);
        },
        findUnique: async ({ where }) => clone(orders.find(o => o.id === where.id) ?? null),
        updateMany: async ({ where, data }) => {
            const found = orders.find(o => o.id === where.id && o.status === where.status);
            if (!found) return { count: 0 };
            found.status = data.status;
            return { count: 1 };
        }
    },
    orderItem: {
        updateMany: async ({ where, data }) => {
            const order = orders.find(o => o.id === where.orderId);
            order.items.forEach(item => { item.coreStatus = data.coreStatus; });
            return { count: order.items.length };
        }
    },
    // Like the real thing: if the callback throws, every change it made is undone.
    $transaction: async (callback) => {
        const snapshot = clone({ parts, orders });
        try {
            return await callback(fakePrisma);
        } catch (err) {
            parts = snapshot.parts;
            orders = snapshot.orders;
            throw err;
        }
    }
};

// Make the controller (and auth/wholesale modules) use the fake instead of the real client.
const prismaPath = require.resolve('../src/middleware/prisma');
require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: fakePrisma };

const { createOrder, updateOrderStatus } = require('../src/controllers/ordersController');

const makeRes = () => ({
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
});

const makePart = (overrides) => ({
    id: 'p1',
    partNumber: 'INJ-1001',
    description: 'Common Rail Injector',
    price: '100.00',
    coreCharge: '25.00',
    quantityOnHand: 5,
    active: true,
    ...overrides
});

test.beforeEach(() => {
    parts = [makePart(), makePart({ id: 'p2', partNumber: 'FLT-2001', price: '10.00', coreCharge: null, quantityOnHand: 2 })];
    orders = [];
    users = {
        customer: { isAdmin: false, wholesaleStatus: 'NONE', wholesaleDiscountPercent: 0 },
        wholesale: { isAdmin: false, wholesaleStatus: 'APPROVED', wholesaleDiscountPercent: 20 },
        pending: { isAdmin: false, wholesaleStatus: 'PENDING', wholesaleDiscountPercent: 20 }
    };
});

const placeOrder = async (userId, items) => {
    const res = makeRes();
    await createOrder({ user: { userId }, body: { items } }, res);
    return res;
};

test('placing an order decrements stock and prices from the database', async () => {
    const res = await placeOrder('customer', [{ partId: 'p1', quantity: 2 }, { partId: 'p2', quantity: 1 }]);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.status, 'PAID');
    assert.equal(res.body.subtotal, '210.00');
    assert.equal(res.body.coreChargeTotal, '50.00');
    assert.equal(res.body.total, '260.00');
    assert.equal(parts.find(p => p.id === 'p1').quantityOnHand, 3);
    assert.equal(parts.find(p => p.id === 'p2').quantityOnHand, 1);
});

test('approved wholesale customers are charged the wholesale price', async () => {
    const res = await placeOrder('wholesale', [{ partId: 'p1', quantity: 1 }]);
    assert.equal(res.body.items[0].unitPrice, '80.00');
});

test('a pending wholesale request does not get the discount yet', async () => {
    const res = await placeOrder('pending', [{ partId: 'p1', quantity: 1 }]);
    assert.equal(res.body.items[0].unitPrice, '100.00');
});

test('ordering more than is in stock is refused and nothing changes', async () => {
    const res = await placeOrder('customer', [{ partId: 'p1', quantity: 6 }]);
    assert.equal(res.statusCode, 409);
    assert.equal(parts.find(p => p.id === 'p1').quantityOnHand, 5);
    assert.equal(orders.length, 0);
});

test('if stock is claimed by someone else mid-checkout, the whole order rolls back', async () => {
    // Simulate a race: the pre-check passes, then the second part sells out before it is claimed.
    const originalUpdateMany = fakePrisma.part.updateMany;
    fakePrisma.part.updateMany = async (args) => {
        if (args.where.id === 'p2') {
            parts.find(p => p.id === 'p2').quantityOnHand = 0;
        }
        return originalUpdateMany(args);
    };

    try {
        const res = await placeOrder('customer', [{ partId: 'p1', quantity: 1 }, { partId: 'p2', quantity: 1 }]);
        assert.equal(res.statusCode, 409);
        assert.equal(parts.find(p => p.id === 'p1').quantityOnHand, 5); // p1 was claimed, then restored
        assert.equal(orders.length, 0);
    } finally {
        fakePrisma.part.updateMany = originalUpdateMany;
    }
});

test('inactive parts cannot be ordered', async () => {
    parts[0].active = false;
    const res = await placeOrder('customer', [{ partId: 'p1', quantity: 1 }]);
    assert.equal(res.statusCode, 400);
});

test('duplicate cart lines are merged before the stock check', async () => {
    const res = await placeOrder('customer', [{ partId: 'p2', quantity: 1 }, { partId: 'p2', quantity: 2 }]);
    assert.equal(res.statusCode, 409); // 3 requested, 2 in stock
});

const changeStatus = async (id, status) => {
    const res = makeRes();
    await updateOrderStatus({ params: { id }, body: { status } }, res);
    return res;
};

test('cancelling an order puts the stock back and clears core tracking', async () => {
    await placeOrder('customer', [{ partId: 'p1', quantity: 2 }]);
    assert.equal(parts.find(p => p.id === 'p1').quantityOnHand, 3);

    const res = await changeStatus('order1', 'CANCELLED');

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'CANCELLED');
    assert.deepEqual(res.body.allowedStatuses, []);
    assert.equal(parts.find(p => p.id === 'p1').quantityOnHand, 5);
    assert.equal(res.body.items[0].coreStatus, 'NONE');
});

test('fulfilling an order keeps the stock decremented', async () => {
    await placeOrder('customer', [{ partId: 'p1', quantity: 2 }]);
    const res = await changeStatus('order1', 'FULFILLED');

    assert.equal(res.statusCode, 200);
    assert.equal(parts.find(p => p.id === 'p1').quantityOnHand, 3);
});

test('a cancelled order cannot be cancelled again or the stock would be restored twice', async () => {
    await placeOrder('customer', [{ partId: 'p1', quantity: 2 }]);
    await changeStatus('order1', 'CANCELLED');
    const res = await changeStatus('order1', 'CANCELLED');

    assert.equal(res.statusCode, 400);
    assert.equal(parts.find(p => p.id === 'p1').quantityOnHand, 5);
});

test('changing an unknown order returns 404', async () => {
    const res = await changeStatus('missing', 'FULFILLED');
    assert.equal(res.statusCode, 404);
});
