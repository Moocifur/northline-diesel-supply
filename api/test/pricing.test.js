const test = require('node:test');
const assert = require('node:assert/strict');
const { OrderError, computeWholesalePrice, normalizeOrderItems, buildOrderLines } = require('../src/services/pricing');

const part = (overrides = {}) => ({
    id: 'p1',
    partNumber: 'INJ-1001',
    description: 'Common Rail Injector',
    price: '100.00',
    coreCharge: null,
    quantityOnHand: 10,
    active: true,
    ...overrides
});

const retail = { canSeeWholesale: false, discountPercent: 0 };

test('computeWholesalePrice applies the discount and rounds to cents', () => {
    assert.equal(computeWholesalePrice('19.99', 10).toFixed(2), '17.99'); // 17.991
    assert.equal(computeWholesalePrice('100', 25).toFixed(2), '75.00');
});

test('computeWholesalePrice returns null when there is nothing to discount', () => {
    assert.equal(computeWholesalePrice('100', 0), null);
    assert.equal(computeWholesalePrice(null, 20), null);
    assert.equal(computeWholesalePrice('100', undefined), null);
});

test('normalizeOrderItems merges duplicate lines', () => {
    const items = normalizeOrderItems([
        { partId: 'a', quantity: 1 },
        { partId: 'b', quantity: 2 },
        { partId: 'a', quantity: 3 }
    ]);
    assert.deepEqual(items, [{ partId: 'a', quantity: 4 }, { partId: 'b', quantity: 2 }]);
});

test('normalizeOrderItems rejects bad input', () => {
    assert.throws(() => normalizeOrderItems([]), OrderError);
    assert.throws(() => normalizeOrderItems(undefined), OrderError);
    assert.throws(() => normalizeOrderItems([{ partId: 'a', quantity: 0 }]), OrderError);
    assert.throws(() => normalizeOrderItems([{ partId: 'a', quantity: 1.5 }]), OrderError);
    assert.throws(() => normalizeOrderItems([{ partId: 'a', quantity: 1000 }]), OrderError);
    assert.throws(() => normalizeOrderItems([{ quantity: 1 }]), OrderError);
});

test('buildOrderLines totals a retail order with core charges', () => {
    const parts = { p1: part({ coreCharge: '25.00' }), p2: part({ id: 'p2', partNumber: 'FLT-2001', price: '9.99' }) };
    const result = buildOrderLines([{ partId: 'p1', quantity: 2 }, { partId: 'p2', quantity: 3 }], parts, retail);

    assert.equal(result.subtotal, '229.97'); // 2 * 100.00 + 3 * 9.99
    assert.equal(result.coreChargeTotal, '50.00');
    assert.equal(result.total, '279.97');
    assert.equal(result.lines[0].coreStatus, 'PENDING');
    assert.equal(result.lines[1].coreStatus, 'NONE');
    assert.equal(result.lines[1].coreCharge, null);
});

test('buildOrderLines uses the wholesale price for approved customers', () => {
    const result = buildOrderLines(
        [{ partId: 'p1', quantity: 2 }],
        { p1: part() },
        { canSeeWholesale: true, discountPercent: 20 }
    );
    assert.equal(result.lines[0].unitPrice, '80.00');
    assert.equal(result.subtotal, '160.00');
});

test('buildOrderLines ignores the discount for non-wholesale customers', () => {
    const result = buildOrderLines(
        [{ partId: 'p1', quantity: 1 }],
        { p1: part() },
        { canSeeWholesale: false, discountPercent: 20 }
    );
    assert.equal(result.lines[0].unitPrice, '100.00');
});

test('buildOrderLines treats a core charge of 0 as no core charge', () => {
    const result = buildOrderLines([{ partId: 'p1', quantity: 1 }], { p1: part({ coreCharge: '0.00' }) }, retail);
    assert.equal(result.lines[0].coreCharge, null);
    assert.equal(result.lines[0].coreStatus, 'NONE');
    assert.equal(result.coreChargeTotal, '0.00');
});

test('buildOrderLines refuses missing, inactive and unpriced parts', () => {
    assert.throws(() => buildOrderLines([{ partId: 'nope', quantity: 1 }], {}, retail), { status: 400 });
    assert.throws(() => buildOrderLines([{ partId: 'p1', quantity: 1 }], { p1: part({ active: false }) }, retail), { status: 400 });
    assert.throws(() => buildOrderLines([{ partId: 'p1', quantity: 1 }], { p1: part({ price: null }) }, retail), { status: 400 });
});

test('buildOrderLines refuses to oversell', () => {
    const low = { p1: part({ quantityOnHand: 2 }) };
    assert.throws(() => buildOrderLines([{ partId: 'p1', quantity: 3 }], low, retail), { status: 409, message: /Only 2/ });

    const none = { p1: part({ quantityOnHand: 0 }) };
    assert.throws(() => buildOrderLines([{ partId: 'p1', quantity: 1 }], none, retail), { status: 409, message: /out of stock/ });
});
