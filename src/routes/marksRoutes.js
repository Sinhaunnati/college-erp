const express = require('express');
const router = express.Router();
const { enterMarks, getMarksByEnrollment, getStudentMarks } = require('../controllers/marksController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyRole('faculty', 'admin'), enterMarks);
router.get('/enrollment/:enrollment_id', verifyToken, getMarksByEnrollment);
router.get('/student/:student_id', verifyToken, getStudentMarks);

module.exports = router;