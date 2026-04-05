const express = require('express');
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, verifyRole('faculty', 'admin'), markAttendance);
router.get('/:enrollment_id', verifyToken, getAttendance);

module.exports = router;