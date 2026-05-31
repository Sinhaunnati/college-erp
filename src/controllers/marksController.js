const pool = require('../config/db');

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 50) return 'B';
  if (percentage >= 40) return 'C';
  return 'F';
};

const enterMarks = async (req, res) => {
  try {
    const { enrollment_id, exam_type, marks_obtained, max_marks } = req.body;
    const percentage = (marks_obtained / max_marks) * 100;
    const grade = calculateGrade(percentage);

    const result = await pool.query(
      `INSERT INTO marks (enrollment_id, exam_type, marks_obtained, max_marks, percentage, grade)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [enrollment_id, exam_type, marks_obtained, max_marks, percentage, grade]
    );

    res.status(201).json({ message: 'Marks entered successfully', marks: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMarksByEnrollment = async (req, res) => {
  try {
    const { enrollment_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM marks WHERE enrollment_id = $1 ORDER BY exam_type`,
      [enrollment_id]
    );
    res.json({ marks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentMarks = async (req, res) => {
  try {
    const { student_id } = req.params;
    const result = await pool.query(
      `SELECT m.*, c.code, c.name, c.credits, e.semester_number
       FROM marks m
       JOIN enrollments e ON m.enrollment_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1
       ORDER BY e.semester_number, c.code`,
      [student_id]
    );
    res.json({ marks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { enterMarks, getMarksByEnrollment, getStudentMarks };