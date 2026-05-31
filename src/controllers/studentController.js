const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const createStudent = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      erp_id,
      roll_number,
      program,
      batch_year,
      phone
    } = req.body;

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingStudent = await pool.query(
      'SELECT * FROM students WHERE erp_id = $1',
      [erp_id]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(400).json({ message: 'Student with this ERP ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (email, password, role)
       VALUES ($1, $2, 'student') RETURNING id`,
      [email, hashedPassword]
    );

    const userId = newUser.rows[0].id;

    const newStudent = await pool.query(
      `INSERT INTO students 
        (user_id, erp_id, roll_number, full_name, program, batch_year, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, erp_id, roll_number, full_name, program, batch_year, email, phone]
    );

    res.status(201).json({
      message: 'Student created successfully',
      student: newStudent.rows[0]
    });

  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ student: student.rows[0] });

  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getStudentByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const student = await pool.query(
      'SELECT * FROM students WHERE user_id = $1',
      [user_id]
    );
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.json({ student: student.rows[0] });
  } catch (err) {
    console.error('Get student by user_id error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllStudents = async (req, res) => {
  console.log('✅ getAllStudents function called');
  try {
    const students = await pool.query(
      'SELECT * FROM students ORDER BY id'
    );
    console.log(`✅ Found ${students.rows.length} students`);
    res.json({ students: students.rows });
  } catch (err) {
    console.error('❌ Error in getAllStudents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createStudent, getStudent, getStudentByUserId, getAllStudents };