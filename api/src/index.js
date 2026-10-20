const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const partsRouter = require('./routes/parts');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');

// Fail at startup, not on the first login, if the app is misconfigured.
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Copy api/.env.example to api/.env and fill it in.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS_ORIGIN can be one origin or a comma-separated list. It is only needed when a browser calls
// the API directly from another origin; the storefront calls the API from its server, and the admin
// panel goes through a same-origin proxy (see admin/vite.config.js and admin/netlify.toml).
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
    : false;

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['X-Total-Count']
}));
app.use(cookieParser());
app.use(express.json());

app.use('/parts', partsRouter);

app.use('/auth', authRouter);

app.use('/users', usersRouter);

app.use('/orders', ordersRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Demo shop API is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Anything thrown (or rejected) in a route lands here. Express 5 forwards async errors automatically.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
