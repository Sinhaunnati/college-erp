// const express = require('express');
// const router = express.Router();
// const { createFeeLedger, makePayment, getFeeStatus, applyWalletToFee } = require('../controllers/feeController');
// const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// router.post('/ledger', verifyToken, verifyRole('admin'), createFeeLedger);
// router.post('/payment', verifyToken, verifyRole('admin'), makePayment);
// router.get('/status/:student_id', verifyToken, getFeeStatus);
// router.post('/wallet/apply', verifyToken, applyWalletToFee);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { createFeeLedger, makePayment, getFeeStatus, applyWalletToFee } = require('../controllers/feeController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/ledger', verifyToken, verifyRole('admin'), createFeeLedger);
router.post('/payment', verifyToken, verifyRole('admin'), makePayment);
router.get('/status/:student_id', verifyToken, getFeeStatus);
router.post('/wallet/apply', verifyToken, applyWalletToFee);

// Stats endpoint for admin dashboard
router.get('/stats', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(amount_paid), 0) as total_collected,
        COALESCE(SUM(total_fee - amount_paid), 0) as pending
      FROM fee_ledger
    `);
    res.json({ 
      totalFeesCollected: parseFloat(result.rows[0].total_collected), 
      pendingFees: parseFloat(result.rows[0].pending) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;