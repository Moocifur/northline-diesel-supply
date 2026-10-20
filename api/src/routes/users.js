const express = require('express');
const router = express.Router();
const { getMe, getAllUsers, requestWholesale, approveWholesale, revokeWholesale, setWholesaleDiscount, makeAdmin, removeAdmin } = require('../controllers/usersController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/me', authenticate, getMe);
router.put('/me/request-wholesale', authenticate, requestWholesale);
router.get('/', authenticate, requireAdmin, getAllUsers);
router.put('/:id/approve-wholesale', authenticate, requireAdmin, approveWholesale);
router.put('/:id/revoke-wholesale', authenticate, requireAdmin, revokeWholesale);
router.put('/:id/wholesale-discount', authenticate, requireAdmin, setWholesaleDiscount);
router.put('/:id/make-admin', authenticate, requireAdmin, makeAdmin);
router.put('/:id/remove-admin', authenticate, requireAdmin, removeAdmin);

module.exports = router;