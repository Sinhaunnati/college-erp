const pool = require('../config/db');

const calculateCGPA = (percentage) => {
  if (percentage >= 90) return 10.0;
  if (percentage >= 80) return 9.0;
  if (percentage >= 70) return 8.0;
  if (percentage >= 60) return 7.0;
  if (percentage >= 50) return 6.0;
  if (percentage >= 40) return 5.0;
  return 0.0;
};

const calculateSemesterResult = async (req, res) => {
  try {
    const { student_id, semester_number, academic_year } = req.body;

    const marksResult = await pool.query(
      `SELECT m.*, c.credits
       FROM marks m
       JOIN enrollments e ON m.enrollment_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1 AND e.semester_number = $2 AND e.academic_year = $3`,
      [student_id, semester_number, academic_year]
    );

    if (marksResult.rows.length === 0) {
      return res.status(404).json({ message: 'No marks found for this semester' });
    }

    let totalObtained = 0;
    let totalMax = 0;
    marksResult.rows.forEach(mark => {
      totalObtained += parseFloat(mark.marks_obtained);
      totalMax += parseFloat(mark.max_marks);
    });

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const cgpa = calculateCGPA(percentage);
    const status = percentage >= 40 ? 'pass' : 'fail';

    const result = await pool.query(
      `INSERT INTO results (student_id, semester_number, academic_year, total_marks, total_max_marks, percentage, cgpa, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [student_id, semester_number, academic_year, totalObtained, totalMax, percentage, cgpa, status]
    );

    res.json({ message: 'Result calculated successfully', result: result.rows[0] });
  } catch (err) {
    console.error('Error in calculateSemesterResult:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getStudentResults = async (req, res) => {
  try {
    const { student_id } = req.params;
    const results = await pool.query(
      `SELECT * FROM results WHERE student_id = $1 ORDER BY semester_number`,
      [student_id]
    );
    
    // Calculate overall CGPA
    let totalPercentage = 0;
    results.rows.forEach(r => {
      totalPercentage += parseFloat(r.percentage);
    });
    const overallCGPA = results.rows.length > 0 ? calculateCGPA(totalPercentage / results.rows.length) : 0;

    res.json({
      results: results.rows,
      overall_cgpa: overallCGPA,
      total_semesters: results.rows.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { calculateSemesterResult, getStudentResults };