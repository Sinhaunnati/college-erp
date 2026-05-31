const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const { verifyToken, verifyRole } = require('./middleware/authMiddleware');

console.log('✓ Routes loaded:');
console.log('  - Auth routes:', typeof authRoutes);
console.log('  - Student routes:', typeof studentRoutes);
console.log('  - Fee routes:', typeof feeRoutes);
console.log('  - Attendance routes:', typeof attendanceRoutes);
console.log('  - Faculty routes:', typeof facultyRoutes);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/faculty', facultyRoutes);

console.log('✓ All routes registered');

app.get('/', (req, res) => {
  res.json({ message: 'College ERP API is running' });
});

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, your id is ${req.user.id}` });
});

app.get('/api/admit-card/:student_id', verifyToken, async (req, res) => {
  const { student_id } = req.params;
  const pool = require('./config/db');
  const result = await pool.query(
    'SELECT * FROM admit_cards WHERE student_id = $1',
    [student_id]
  );
  res.json({ admitCards: result.rows });
});

// TEST ROUTES - Remove later
app.get('/api/test-direct', (req, res) => {
  res.json({ message: 'Direct test route works!' });
});

app.get('/api/test-faculty-route', (req, res) => {
  res.json({ message: 'Faculty route test - direct in index.js' });
});

// Temp setup route - remove later
app.post('/api/setup', verifyToken, verifyRole('admin'), async (req, res) => {
  const pool = require('./config/db');
  try {
    const program = await pool.query(
      `INSERT INTO programs (name, total_semesters, degree_type) 
       VALUES ('B.Tech CSE', 8, 'B.Tech') RETURNING *`
    );

    const course = await pool.query(
      `INSERT INTO courses (code, name, credits, program_id, semester_number)
       VALUES ('BCSE401', 'Database Management Systems', 4, $1, 4) RETURNING *`,
      [program.rows[0].id]
    );

    const enrollment = await pool.query(
      `INSERT INTO enrollments (student_id, course_id, semester_number, academic_year)
       VALUES (1, $1, 4, '2025-26') RETURNING *`,
      [course.rows[0].id]
    );

    res.json({ program: program.rows[0], course: course.rows[0], enrollment: enrollment.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const marksRoutes = require('./routes/marksRoutes');
const resultsRoutes = require('./routes/resultsRoutes');

app.use('/api/marks', marksRoutes);
app.use('/api/results', resultsRoutes);