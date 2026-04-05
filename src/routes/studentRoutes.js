const express = require('express');
const router = express.Router();
const { createStudent, getStudent } = require('../controllers/studentController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyRole('admin'), createStudent);
router.get('/:id', verifyToken, getStudent);

module.exports = router;