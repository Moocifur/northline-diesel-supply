const prisma = require('../middleware/prisma');
const { isAdminUser } = require('../middleware/auth');
const { getWholesaleInfo } = require('../services/wholesale');
const { OrderError, normalizeOrderItems, buildOrderLines } = require('../services/pricing');
const { allowedTransitions, canTransition } = require('../services/orderStatus');

// Controllers throw OrderError for expected problems (bad input, out of stock, ...).
// This turns one into the matching HTTP response and rethrows anything unexpected.
const sendOrderError = (err, res) => {
    if (err instanceof OrderError) {
        return res.status(err.status).json({ message: err.message });
    }
    throw err;
};

const withAllowedStatuses = (order) => ({ ...order, allowedStatuses: allowedTransitions(order.status) });

// POST /orders  { items: [{ partId, quantity }] }
//
// 1. validate the cart and merge duplicate lines
// 2. load the parts and price everything from the database (the client's prices are never trusted)
// 3. inside one transaction: claim the stock, then create the order. If any line cannot be claimed
//    the whole transaction rolls back, so two shoppers can never buy the same last unit.
const createOrder = async (req, res) => {
    try {
        const items = normalizeOrderItems(req.body?.items);

        const parts = await prisma.part.findMany({ where: { id: { in: items.map(item => item.partId) } } });
        const partsById = Object.fromEntries(parts.map(part => [part.id, part]));

        const wholesale = await getWholesaleInfo(req.user);
        const { lines, subtotal, coreChargeTotal, total } = buildOrderLines(items, partsById, wholesale);

        const order = await prisma.$transaction(async (tx) => {
            for (const line of lines) {
                // One conditional UPDATE: it only succeeds while enough stock is left.
                const claimed = await tx.part.updateMany({
                    where: { id: line.partId, active: true, quantityOnHand: { gte: line.quantity } },
                    data: { quantityOnHand: { decrement: line.quantity } }
                });
                if (claimed.count === 0) {
                    throw new OrderError(409, `Not enough stock for ${line.partNumber}`);
                }
            }

            return tx.order.create({
                data: {
                    userId: req.user.userId,
                    // There is no payment processor in this demo, so orders are marked PAID immediately.
                    // With a real processor this would start as PENDING_PAYMENT and flip to PAID
                    // only after the charge is confirmed.
                    status: 'PAID',
                    subtotal,
                    coreChargeTotal,
                    total,
                    items: { create: lines }
                },
                include: { items: true }
            });
        });

        res.status(201).json(order);
    } catch (err) {
        sendOrderError(err, res);
    }
};

const getMyOrders = async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { userId: req.user.userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
};

const getOrderById = async (req, res) => {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true }
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.userId === req.user.userId;
    if (!isOwner && !(await isAdminUser(req.user.userId))) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
};

const getAllOrders = async (req, res) => {
    const orders = await prisma.order.findMany({
        include: {
            items: true,
            user: { select: { name: true, email: true, company: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(orders.map(withAllowedStatuses));
};

// PUT /orders/:id/status  { status }
// Moves an order along its lifecycle (see services/orderStatus.js). Cancelling puts the stock back.
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const status = req.body?.status;

    try {
        const updated = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
            if (!order) {
                throw new OrderError(404, 'Order not found');
            }
            if (!canTransition(order.status, status)) {
                throw new OrderError(400, `An order that is ${order.status} cannot be changed to ${status}`);
            }

            // Guard against two admins changing the same order at once.
            const changed = await tx.order.updateMany({ where: { id, status: order.status }, data: { status } });
            if (changed.count === 0) {
                throw new OrderError(409, 'This order was just changed by someone else. Refresh and try again.');
            }

            if (status === 'CANCELLED') {
                for (const item of order.items) {
                    await tx.part.update({
                        where: { id: item.partId },
                        data: { quantityOnHand: { increment: item.quantity } }
                    });
                }
                // A cancelled order has no core to send back.
                await tx.orderItem.updateMany({ where: { orderId: id }, data: { coreStatus: 'NONE' } });
            }

            return tx.order.findUnique({ where: { id }, include: { items: true } });
        });

        res.json(withAllowedStatuses(updated));
    } catch (err) {
        sendOrderError(err, res);
    }
};

const VALID_CORE_STATUSES = ['NONE', 'PENDING', 'RETURNED', 'INSPECTED', 'REFUNDED', 'REJECTED'];

const updateCoreStatus = async (req, res) => {
    const { orderId, itemId } = req.params;
    const { coreStatus } = req.body;

    if (!VALID_CORE_STATUSES.includes(coreStatus)) {
        return res.status(400).json({ message: 'Invalid core status' });
    }

    const item = await prisma.orderItem.findUnique({
        where: { id: itemId },
        include: { order: { select: { status: true } } }
    });
    if (!item || item.orderId !== orderId) {
        return res.status(404).json({ message: 'Order item not found' });
    }
    if (item.order.status === 'CANCELLED') {
        return res.status(400).json({ message: 'Cannot change the core status of a cancelled order' });
    }

    const updated = await prisma.orderItem.update({
        where: { id: itemId },
        data: { coreStatus }
    });

    res.json(updated);
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, updateCoreStatus };
