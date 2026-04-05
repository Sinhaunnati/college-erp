const pool = require('../config/db');

const markAttendance = async (req, res) => {
  try {
    const { enrollment_id, date, status, marked_by } = req.body;

    const existing = await pool.query(
      'SELECT * FROM attendance WHERE enrollment_id = $1 AND date = $2',
      [enrollment_id, date]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    const attendance = await pool.query(
      `INSERT INTO attendance (enrollment_id, date, status, marked_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [enrollment_id, date, status, marked_by]
    );

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: attendance.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { enrollment_id } = req.params;

    const records = await pool.query(
      'SELECT * FROM attendance WHERE enrollment_id = $1 ORDER BY date',
      [enrollment_id]
    );

    const total = records.rows.length;
    const present = records.rows.filter(r => r.status === 'present').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    const alert = percentage < 75 ? 'WARNING: Attendance below 75%' : null;

    res.json({
      records: records.rows,
      summary: {
        total_classes: total,
        present: present,
        absent: total - present,
        percentage: parseFloat(percentage),
        alert
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { markAttendance, getAttendance };