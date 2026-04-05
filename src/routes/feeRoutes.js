const express = require('express');
const router = express.Router();
const { createFeeLedger, makePayment, getFeeStatus } = require('../controllers/feeController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/ledger', verifyToken, verifyRole('admin'), createFeeLedger);
router.post('/payment', verifyToken, verifyRole('admin'), makePayment);
router.get('/status/:student_id', verifyToken, getFeeStatus);

module.exports = router;