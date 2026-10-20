const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, updateCoreStatus } = require('../controllers/ordersController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', authenticate, createOrder);
router.get('/mine', authenticate, getMyOrders);
router.get('/', authenticate, requireAdmin, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);
router.put('/:orderId/items/:itemId/core-status', authenticate, requireAdmin, updateCoreStatus);

module.exports = router;
