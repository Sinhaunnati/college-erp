// const express = require('express');
// const router = express.Router();

// // Simple test route
// router.get('/test', (req, res) => {
//   res.json({ message: 'Faculty routes working!' });
// });

// router.get('/courses/:faculty_id', (req, res) => {
//   res.json({ message: `Courses for faculty ${req.params.faculty_id}` });
// });

// router.get('/course/:course_id/students', (req, res) => {
//   res.json({ message: `Students for course ${req.params.course_id}` });
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { getFacultyCourses, getCourseStudents } = require('../controllers/facultyController');
// const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// router.get('/courses/:faculty_id', verifyToken, getFacultyCourses);
// router.get('/course/:course_id/students', verifyToken, getCourseStudents);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { getFacultyCourses, getCourseStudents, getFacultyProfile } = require('../controllers/facultyController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// IMPORTANT: Put specific routes BEFORE parameter routes
router.get('/test', (req, res) => {
  res.json({ message: 'Faculty routes are working!' });
});
router.get('/profile/:user_id', verifyToken, getFacultyProfile);
router.get('/courses/:faculty_id', verifyToken, getFacultyCourses);
router.get('/course/:course_id/students', verifyToken, getCourseStudents);

module.exports = router;