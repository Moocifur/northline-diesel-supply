const prisma = require('../middleware/prisma');
const { computeWholesalePrice } = require('./pricing');

// Looks the requester up in the database on every call, so approvals, revocations and admin changes
// take effect immediately instead of waiting for a JWT to expire.
const getWholesaleInfo = async (user) => {
    const anonymous = { isAdmin: false, canSeeWholesale: false, discountPercent: 0 };
    if (!user) return anonymous;

    const requester = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { isAdmin: true, wholesaleStatus: true, wholesaleDiscountPercent: true }
    });
    if (!requester) return anonymous;

    return {
        isAdmin: requester.isAdmin,
        canSeeWholesale: requester.isAdmin || requester.wholesaleStatus === 'APPROVED',
        discountPercent: requester.wholesaleDiscountPercent
    };
};

module.exports = { getWholesaleInfo, computeWholesalePrice };
