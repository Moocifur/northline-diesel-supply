const prisma = require('../middleware/prisma');

const USER_FIELDS = {
    id: true,
    email: true,
    name: true,
    company: true,
    wholesaleStatus: true,
    wholesaleDiscountPercent: true,
    isAdmin: true,
    isOwner: true,
    createdAt: true
};

const getMe = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: USER_FIELDS
    });
    res.json(user);
};

const getAllUsers = async (req, res) => {
    const users = await prisma.user.findMany({
        select: USER_FIELDS
    });
    res.json(users);
};

const requestWholesale = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { wholesaleStatus: true }
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (user.wholesaleStatus !== 'NONE') {
        return res.status(400).json({ message: 'A wholesale request is already pending or approved' });
    }

    const updated = await prisma.user.update({
        where: { id: req.user.userId },
        data: { wholesaleStatus: 'PENDING' },
        select: USER_FIELDS
    });
    res.json(updated);
};

const approveWholesale = async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.update({
        where: { id },
        data: { wholesaleStatus: 'APPROVED' },
        select: USER_FIELDS
    });
    res.json(user);
}

const revokeWholesale = async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.update({
        where: { id },
        data: { wholesaleStatus: 'NONE' },
        select: USER_FIELDS
    });
    res.json(user);
}

const setWholesaleDiscount = async (req, res) => {
    const { id } = req.params;
    const { discountPercent } = req.body;

    const percent = Number(discountPercent);
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
        return res.status(400).json({ message: 'Discount percent must be a whole number between 0 and 100' });
    }

    const user = await prisma.user.update({
        where: { id },
        data: { wholesaleDiscountPercent: percent },
        select: USER_FIELDS
    });
    res.json(user);
};

const makeAdmin = async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.update({
        where: { id },
        data: { isAdmin: true },
        select: USER_FIELDS
    });
    res.json(user);
};

const removeAdmin = async (req, res) => {
    const { id } = req.params;

    const target = await prisma.user.findUnique({ where: { id }, select: { isAdmin: true, isOwner: true } });
    if (!target) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (target.isOwner) {
        return res.status(400).json({ message: 'Cannot remove admin from the owner account' });
    }

    if (target.isAdmin) {
        const adminCount = await prisma.user.count({ where: { isAdmin: true } });
        if (adminCount <= 1) {
            return res.status(400).json({ message: 'Cannot remove the last remaining admin' });
        }
    }

    const user = await prisma.user.update({
        where: { id },
        data: { isAdmin: false },
        select: USER_FIELDS
    });
    res.json(user);
};

module.exports = { getMe, getAllUsers, requestWholesale, approveWholesale, revokeWholesale, setWholesaleDiscount, makeAdmin, removeAdmin };
