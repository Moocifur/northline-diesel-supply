const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../middleware/prisma');

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

const register = async (req, res) => {
    const { password, name, company } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !email.includes('@') || typeof password !== 'string' || !name) {
        return res.status(400).json({ message: 'A valid email, password, and name are required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashed,
                name,
                company,
            },
        });
        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ message: 'Email already in use' });
        }
        throw err;
    }
};

const login = async (req, res) => {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    // Case-insensitive so accounts created before emails were lowercased still work.
    const user = email
        ? await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
        : null;
    if (!user || typeof password !== 'string') return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // The token only says WHO you are. What you are allowed to do (admin, wholesale) is looked up
    // in the database on each request, so changes apply immediately.
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 * 1000
    });

    res.json({ token });
};

const logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('token', {
        path: '/',
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    res.json({ message: 'Logged out' });
};

module.exports = { register, login, logout };
