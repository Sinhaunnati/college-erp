const pool = require('./db');

const seed = async () => {
  try {
    // Create faculty profile for user_id 4
    await pool.query(`
      INSERT INTO faculty (user_id, employee_code, full_name, department, email)
      VALUES (4, 'FAC001', 'Faculty User', 'Computer Science', 'faculty@niet.com')
      ON CONFLICT (employee_code) DO NOTHING
    `);
    console.log('Faculty profile created');

    // Get the faculty profile id
    const facultyProfile = await pool.query('SELECT id FROM faculty WHERE user_id = 4');
    const facultyId = facultyProfile.rows[0].id;
    console.log('Faculty profile ID:', facultyId);

    // Assign course to faculty
    await pool.query(`
      INSERT INTO course_faculty (course_id, faculty_id, section, semester_number, academic_year)
      VALUES (1, $1, 'A', 4, '2025-26')
      ON CONFLICT DO NOTHING
    `, [facultyId]);
    console.log('Course assigned successfully');

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seed();