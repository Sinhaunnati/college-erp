const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Get analytics data for admin dashboard
router.get('/analytics', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const pool = require('../config/db');

    // Fee collection by month
    const feeData = await pool.query(`
      SELECT 
        DATE_TRUNC('month', date) as month,
        SUM(amount) as total
      FROM transactions
      WHERE type != 'wallet_transfer'
      GROUP BY month
      ORDER BY month
      LIMIT 12
    `);

    // Attendance distribution
    const attendanceData = await pool.query(`
      SELECT 
        CASE 
          WHEN percentage >= 75 THEN 'Above 75%'
          WHEN percentage >= 50 THEN '50-75%'
          ELSE 'Below 50%'
        END as range,
        COUNT(*) as count
      FROM (
        SELECT 
          e.student_id,
          AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 as percentage
        FROM enrollments e
        LEFT JOIN attendance a ON e.id = a.enrollment_id
        GROUP BY e.student_id
      ) as attendance_summary
      GROUP BY range
    `);

    // Student status
    const studentStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM students
      GROUP BY status
    `);

    // Fee status
    const feeStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM fee_ledger
      GROUP BY status
    `);

    res.json({
      feeCollection: feeData.rows,
      attendance: attendanceData.rows,
      studentStatus: studentStatus.rows,
      feeStatus: feeStatus.rows
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;