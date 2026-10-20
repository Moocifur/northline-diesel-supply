// Pure pricing and order-building logic. No database access in this file, so it is easy to unit test.
//
// Money rule: never use JavaScript numbers for prices. Everything goes through Decimal
// (decimal.js, the same library Prisma uses under the hood for Decimal columns).
const Decimal = require('decimal.js');

const MAX_LINE_QUANTITY = 999;

// An error that carries the HTTP status the controller should answer with.
class OrderError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// Accepts a Prisma Decimal, a Decimal, a number or a string. Null/undefined stay null.
const toDecimal = (value) => (value === null || value === undefined ? null : new Decimal(value.toString()));

// price * (100 - discount) / 100, rounded to cents. Returns null when no discount applies.
const computeWholesalePrice = (price, discountPercent) => {
    const base = toDecimal(price);
    if (base === null || !discountPercent || discountPercent <= 0) return null;
    return base.times(new Decimal(100 - discountPercent).dividedBy(100)).toDecimalPlaces(2);
};

// Validates the cart payload and merges duplicate lines for the same part.
const normalizeOrderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new OrderError(400, 'Order must include at least one item');
    }

    const quantities = new Map();
    for (const item of items) {
        const valid = item
            && typeof item.partId === 'string'
            && Number.isInteger(item.quantity)
            && item.quantity >= 1
            && item.quantity <= MAX_LINE_QUANTITY;
        if (!valid) {
            throw new OrderError(400, `Each item needs a partId and a whole-number quantity between 1 and ${MAX_LINE_QUANTITY}`);
        }
        quantities.set(item.partId, (quantities.get(item.partId) || 0) + item.quantity);
    }

    return [...quantities].map(([partId, quantity]) => {
        if (quantity > MAX_LINE_QUANTITY) {
            throw new OrderError(400, `You can order at most ${MAX_LINE_QUANTITY} of a single part`);
        }
        return { partId, quantity };
    });
};

// Turns normalized cart items + the parts loaded from the database into order lines and totals.
// Prices always come from the database row, never from the client.
const buildOrderLines = (items, partsById, { canSeeWholesale, discountPercent }) => {
    let subtotal = new Decimal(0);
    let coreChargeTotal = new Decimal(0);
    const lines = [];

    for (const { partId, quantity } of items) {
        const part = partsById[partId];

        if (!part || !part.active) {
            throw new OrderError(400, 'A part in your cart is no longer available');
        }
        if (part.price === null || part.price === undefined) {
            throw new OrderError(400, `${part.partNumber} has no price set and cannot be ordered`);
        }
        if (part.quantityOnHand < quantity) {
            const message = part.quantityOnHand > 0
                ? `Only ${part.quantityOnHand} of ${part.partNumber} in stock`
                : `${part.partNumber} is out of stock`;
            throw new OrderError(409, message);
        }

        const wholesalePrice = canSeeWholesale ? computeWholesalePrice(part.price, discountPercent) : null;
        const unitPrice = wholesalePrice ?? toDecimal(part.price);

        // A core charge of 0 is the same as no core charge.
        const rawCore = toDecimal(part.coreCharge);
        const coreCharge = rawCore !== null && rawCore.greaterThan(0) ? rawCore : null;

        subtotal = subtotal.plus(unitPrice.times(quantity));
        if (coreCharge) {
            coreChargeTotal = coreChargeTotal.plus(coreCharge.times(quantity));
        }

        lines.push({
            partId: part.id,
            partNumber: part.partNumber,
            description: part.description,
            unitPrice: unitPrice.toFixed(2),
            coreCharge: coreCharge ? coreCharge.toFixed(2) : null,
            quantity,
            coreStatus: coreCharge ? 'PENDING' : 'NONE'
        });
    }

    return {
        lines,
        subtotal: subtotal.toFixed(2),
        coreChargeTotal: coreChargeTotal.toFixed(2),
        total: subtotal.plus(coreChargeTotal).toFixed(2)
    };
};

module.exports = { OrderError, MAX_LINE_QUANTITY, toDecimal, computeWholesalePrice, normalizeOrderItems, buildOrderLines };
