// // const express = require('express');
// // const router = express.Router();
// // const { createStudent, getStudent, getStudentByUserId } = require('../controllers/studentController');
// // const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// // router.post('/', verifyToken, verifyRole('admin'), createStudent);
// // router.get('/:id', verifyToken, getStudent);

// // module.exports = router;
// // router.get('/by-user/:user_id', verifyToken, getStudentByUserId);


// const express = require('express');
// const router = express.Router();
// const { createStudent, getStudent, getStudentByUserId, getAllStudents } = require('../controllers/studentController');
// const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// console.log('📁 studentRoutes loaded');

// router.post('/', verifyToken, verifyRole('admin'), createStudent);
// router.get('/:id', verifyToken, getStudent);
// router.get('/by-user/:user_id', verifyToken, getStudentByUserId);
// router.get('/all', verifyToken, verifyRole('admin'), getAllStudents);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { createStudent, getStudent, getStudentByUserId, getAllStudents } = require('../controllers/studentController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// IMPORTANT: Put specific routes BEFORE parameter routes
router.get('/all', verifyToken, verifyRole('admin'), getAllStudents);
router.get('/by-user/:user_id', verifyToken, getStudentByUserId);
router.get('/:id', verifyToken, getStudent);
router.post('/', verifyToken, verifyRole('admin'), createStudent);

module.exports = router;