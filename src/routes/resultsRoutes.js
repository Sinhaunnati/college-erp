const express = require('express');
const router = express.Router();
const { calculateSemesterResult, getStudentResults } = require('../controllers/resultsController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/calculate', verifyToken, verifyRole('faculty', 'admin'), calculateSemesterResult);
router.get('/student/:student_id', verifyToken, getStudentResults);

module.exports = router;