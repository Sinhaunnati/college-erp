const pool = require('../config/db');

const createStudent = async (req, res) => {
  try {
    const {
      user_id,
      erp_id,
      roll_number,
      full_name,
      program,
      batch_year,
      email,
      phone
    } = req.body;

    // Check if student already exists
    const existing = await pool.query(
      'SELECT * FROM students WHERE erp_id = $1',
      [erp_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Student with this ERP ID already exists' });
    }

    const newStudent = await pool.query(
      `INSERT INTO students 
        (user_id, erp_id, roll_number, full_name, program, batch_year, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, erp_id, roll_number, full_name, program, batch_year, email, phone]
    );

    res.status(201).json({
      message: 'Student created successfully',
      student: newStudent.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createStudent, getStudent };