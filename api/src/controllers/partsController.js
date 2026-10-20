const crypto = require('crypto');
const prisma = require('../middleware/prisma');
const { getWholesaleInfo, computeWholesalePrice } = require('../services/wholesale');
const { validatePart } = require('../services/partValidation');

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;
const MAX_LOOKUP_IDS = 50;

// Adds `wholesalePrice` to a part, but only for people allowed to see it (approved wholesale users
// and admins). Everyone else gets the part without the field at all.
const attachWholesalePrice = (part, canSeeWholesale, discountPercent) => {
    if (!canSeeWholesale) return part;
    const wholesalePrice = computeWholesalePrice(part.price, discountPercent);
    return wholesalePrice === null ? part : { ...part, wholesalePrice: wholesalePrice.toFixed(2) };
};

// GET /parts?page=1&limit=24&search=injector
// The public only sees active parts. Admins see everything so they can reactivate parts.
const getAllParts = async (req, res) => {
    const { isAdmin, canSeeWholesale, discountPercent } = await getWholesaleInfo(req.user);
    const { search } = req.query;

    const take = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const filters = [];
    if (!isAdmin) filters.push({ active: true });
    if (typeof search === 'string' && search.trim()) {
        filters.push({
            OR: [
                { partNumber: { contains: search.trim(), mode: 'insensitive' } },
                { description: { contains: search.trim(), mode: 'insensitive' } },
                { brand: { contains: search.trim(), mode: 'insensitive' } }
            ]
        });
    }
    const where = filters.length ? { AND: filters } : undefined;

    const [parts, total] = await Promise.all([
        prisma.part.findMany({ where, skip: (page - 1) * take, take, orderBy: { partNumber: 'asc' } }),
        prisma.part.count({ where })
    ]);

    res.set('X-Total-Count', String(total));
    res.json(parts.map(part => attachWholesalePrice(part, canSeeWholesale, discountPercent)));
};

const getPartById = async (req, res) => {
    const { id } = req.params;
    const { isAdmin, canSeeWholesale, discountPercent } = await getWholesaleInfo(req.user);

    const part = await prisma.part.findUnique({ where: { id } });
    if (!part || (!part.active && !isAdmin)) {
        return res.status(404).json({ message: 'Part not found' });
    }

    res.json(attachWholesalePrice(part, canSeeWholesale, discountPercent));
};

// POST /parts/lookup  { ids: [...] }
// Used by the cart to refresh prices and stock for whoever is logged in right now.
// Parts that are inactive (or deleted) are simply missing from the response.
const lookupParts = async (req, res) => {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_LOOKUP_IDS || !ids.every(id => typeof id === 'string')) {
        return res.status(400).json({ message: `ids must be a list of 1 to ${MAX_LOOKUP_IDS} part ids` });
    }

    const { isAdmin, canSeeWholesale, discountPercent } = await getWholesaleInfo(req.user);
    const parts = await prisma.part.findMany({
        where: { id: { in: ids }, ...(isAdmin ? {} : { active: true }) }
    });

    res.json(parts.map(part => attachWholesalePrice(part, canSeeWholesale, discountPercent)));
};

const createPart = async (req, res) => {
    const { errors, data } = validatePart(req.body);
    if (errors.length) {
        return res.status(400).json({ message: errors.join('. ') });
    }

    try {
        const part = await prisma.part.create({ data });
        res.status(201).json(part);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ message: 'A part with that part number already exists' });
        }
        throw err;
    }
};

const updatePart = async (req, res) => {
    const { id } = req.params;
    const { errors, data } = validatePart(req.body, { partial: true });
    if (errors.length) {
        return res.status(400).json({ message: errors.join('. ') });
    }

    try {
        const part = await prisma.part.update({ where: { id }, data });
        res.json(part);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ message: 'A part with that part number already exists' });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Part not found' });
        }
        throw err;
    }
};

const deletePart = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.part.delete({ where: { id } });
        res.status(204).send();
    } catch (err) {
        if (err.code === 'P2003') {
            return res.status(409).json({ message: 'Cannot delete a part that has order history. Mark it inactive instead.' });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Part not found' });
        }
        throw err;
    }
};

const csvEscape = (value) => {
    const str = String(value ?? '');
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Constant-time comparison. Also refuses to match when the server has no token configured,
// so a missing environment variable can never leave the feed open.
const tokenMatches = (provided, expected) => {
    if (typeof provided !== 'string' || !expected) return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// GET /parts/supplier-feed.csv?token=...
// A CSV of stock levels that a supplier can pull on a schedule (the "inventory sync" feature).
const getSupplierFeed = async (req, res) => {
    if (!tokenMatches(req.query.token, process.env.SUPPLIER_FEED_TOKEN)) {
        return res.status(401).send('Unauthorized');
    }

    const parts = await prisma.part.findMany({ where: { active: true } });

    const rows = [
        'Location Code,Manufacturer,Part Number,On Hand',
        ...parts.map(part => [
            '',
            csvEscape(part.brand),
            csvEscape(part.partNumber),
            part.quantityOnHand
        ].join(','))
    ];

    res.set('Content-Type', 'text/csv');
    res.send(rows.join('\n'));
};

module.exports = { getAllParts, getPartById, lookupParts, createPart, updatePart, deletePart, getSupplierFeed };
