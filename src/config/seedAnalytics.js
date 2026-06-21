const pool = require('./db');

const seedAnalytics = async () => {
  try {
    console.log('🌱 Seeding analytics data...');

    // 1. Add sample transactions (for Fee Collection chart)
    await pool.query(`
      INSERT INTO transactions (student_id, amount, type, date) VALUES
      (1, 45000, 'online', '2025-01-15'),
      (1, 62000, 'online', '2025-02-20'),
      (1, 38000, 'online', '2025-03-10'),
      (1, 71000, 'online', '2025-04-05'),
      (1, 54000, 'online', '2025-05-25'),
      (1, 89000, 'online', '2025-06-18')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample transactions added');

    // 2. Add sample attendance data
    await pool.query(`
      INSERT INTO attendance (enrollment_id, date, status) VALUES
      (1, '2025-06-01', 'present'),
      (1, '2025-06-02', 'present'),
      (1, '2025-06-03', 'absent'),
      (1, '2025-06-04', 'present'),
      (1, '2025-06-05', 'absent'),
      (1, '2025-06-06', 'present'),
      (1, '2025-06-07', 'present'),
      (1, '2025-06-08', 'present')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample attendance added');

    // 3. Add sample fee status data
    await pool.query(`
      INSERT INTO fee_ledger (student_id, academic_year, semester_number, total_fee, amount_paid, status) VALUES
      (1, '2025-26', 4, 100000, 100000, 'paid'),
      (1, '2025-26', 5, 100000, 50000, 'partial'),
      (2, '2025-26', 4, 100000, 0, 'unpaid')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample fee status added');

    // 4. Add sample student status
    await pool.query(`
      INSERT INTO students (user_id, erp_id, roll_number, full_name, program, batch_year, status) VALUES
      (1, 'ERP999', '2200199', 'Sample Student', 'B.Tech CSE', 2023, 'pursuing'),
      (2, 'ERP998', '2200198', 'Graduated Student', 'B.Tech CSE', 2020, 'graduated')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample student status added');

    console.log('🎉 Analytics seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding analytics:', err.message);
    process.exit(1);
  }
};

seedAnalytics();