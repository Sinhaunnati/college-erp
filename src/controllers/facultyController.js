const pool = require('../config/db');

// Get courses taught by a faculty member
const getFacultyCourses = async (req, res) => {
  try {
    const { faculty_id } = req.params;

    // First find faculty profile by user_id
    const facultyProfile = await pool.query(
      'SELECT id FROM faculty WHERE user_id = $1',
      [faculty_id]
    );

    if (facultyProfile.rows.length === 0) {
      return res.json({ courses: [] });
    }

    const actualFacultyId = facultyProfile.rows[0].id;

    const courses = await pool.query(`
      SELECT c.*, cf.section
      FROM courses c
      JOIN course_faculty cf ON c.id = cf.course_id
      WHERE cf.faculty_id = $1
    `, [actualFacultyId]);

    res.json({ courses: courses.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get students enrolled in a specific course
const getCourseStudents = async (req, res) => {
  try {
    const { course_id } = req.params;
    
    const students = await pool.query(`
      SELECT s.id, s.roll_number, s.full_name, s.email, e.id as enrollment_id
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.course_id = $1 AND e.status = 'active'
    `, [course_id]);
    
    res.json({ students: students.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFacultyProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const faculty = await pool.query(
      'SELECT * FROM faculty WHERE user_id = $1',
      [user_id]
    );
    if (faculty.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }
    res.json({ faculty: faculty.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { getFacultyCourses, getCourseStudents, getFacultyProfile };