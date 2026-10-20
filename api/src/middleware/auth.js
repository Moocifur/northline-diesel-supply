const jwt = require('jsonwebtoken');
const prisma = require('./prisma');

const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.split(' ')[1];
    return headerToken || req.cookies?.token;
};

// Requires a valid token. Sets req.user = { userId }.
const authenticate = (req, res, next) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Like authenticate, but anonymous requests are allowed through with req.user unset.
const optionalAuthenticate = (req, res, next) => {
    const token = extractToken(req);

    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // invalid or expired token: carry on as an anonymous request
        }
    }

    next();
};

// Admin status is read from the database, not from the token, so removing someone's admin
// access takes effect on their very next request.
const isAdminUser = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
    return !!user?.isAdmin;
};

const requireAdmin = async (req, res, next) => {
    if (!req.user || !(await isAdminUser(req.user.userId))) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

module.exports = { authenticate, optionalAuthenticate, requireAdmin, isAdminUser };
