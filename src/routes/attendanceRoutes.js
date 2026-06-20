const express = require('express');
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Existing routes
router.post('/', verifyToken, verifyRole('faculty', 'admin'), markAttendance);
router.get('/:enrollment_id', verifyToken, getAttendance);

// NEW: Get attendance by student (for student dashboard)
router.get('/by-student/:student_id', verifyToken, async (req, res) => {
  try {
    const pool = require('../config/db');
    const { student_id } = req.params;
    
    // Get all enrollments for this student
    const enrollments = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1',
      [student_id]
    );
    
    if (enrollments.rows.length === 0) {
      return res.json({ 
        records: [], 
        summary: { 
          total_classes: 0, 
          present: 0, 
          absent: 0, 
          percentage: 0, 
          alert: null 
        } 
      });
    }
    
    const enrollmentIds = enrollments.rows.map(e => e.id);
    
    // Get attendance for all enrollments
    const records = await pool.query(
      `SELECT * FROM attendance WHERE enrollment_id = ANY($1) ORDER BY date`,
      [enrollmentIds]
    );
    
    const total = records.rows.length;
    const present = records.rows.filter(r => r.status === 'present').length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    const alert = percentage < 75 ? 'WARNING: Attendance below 75%' : null;
    
    res.json({
      records: records.rows,
      summary: {
        total_classes: total,
        present: present,
        absent: total - present,
        percentage: parseFloat(percentage.toFixed(2)),
        alert
      }
    });
  } catch (err) {
    console.error('Error in by-student attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// NEW: Get all students (for admin dashboard)
router.get('/all', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query('SELECT * FROM students ORDER BY id');
    res.json({ students: result.rows });
  } catch (err) {
    console.error('Error in all students:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;