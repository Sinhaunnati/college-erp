const pool = require('../config/db');

const createFeeLedger = async (req, res) => {
  try {
    const { student_id, academic_year, semester_number, total_fee } = req.body;

    const existing = await pool.query(
      'SELECT * FROM fee_ledger WHERE student_id = $1 AND academic_year = $2 AND semester_number = $3',
      [student_id, academic_year, semester_number]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Fee ledger already exists for this semester' });
    }

    const feeLedger = await pool.query(
      `INSERT INTO fee_ledger (student_id, academic_year, semester_number, total_fee)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, academic_year, semester_number, total_fee]
    );

    await pool.query(
      `INSERT INTO student_wallet (student_id) VALUES ($1) ON CONFLICT (student_id) DO NOTHING`,
      [student_id]
    );

    res.status(201).json({
      message: 'Fee ledger created successfully',
      feeLedger: feeLedger.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const makePayment = async (req, res) => {
  try {
    const { student_id, amount, type, reference_number, semester_number, academic_year } = req.body;

    const ledgerResult = await pool.query(
      'SELECT * FROM fee_ledger WHERE student_id = $1 AND semester_number = $2 AND academic_year = $3',
      [student_id, semester_number, academic_year]
    );

    if (ledgerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Fee ledger not found' });
    }

    const ledger = ledgerResult.rows[0];
    const balanceDue = ledger.total_fee - ledger.amount_paid;
    let excessAmount = 0;
    let amountToApply = amount;

    if (type === 'loan' && amount > balanceDue) {
      excessAmount = amount - balanceDue;
      amountToApply = balanceDue;

      await pool.query(
        `INSERT INTO student_wallet (student_id, balance) VALUES ($1, $2)
         ON CONFLICT (student_id) DO UPDATE SET balance = student_wallet.balance + $2,
         last_updated = NOW()`,
        [student_id, excessAmount]
      );
    }

    const transaction = await pool.query(
      `INSERT INTO transactions (student_id, amount, type, reference_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, amount, type, reference_number]
    );

    const updatedLedger = await pool.query(
      `UPDATE fee_ledger 
       SET amount_paid = amount_paid + $1,
           status = CASE 
             WHEN amount_paid + $1 >= total_fee THEN 'paid'
             WHEN amount_paid + $1 > 0 THEN 'partial'
             ELSE 'unpaid'
           END
       WHERE student_id = $2 AND semester_number = $3 AND academic_year = $4
       RETURNING *`,
      [amountToApply, student_id, semester_number, academic_year]
    );

    const updatedLedgerData = updatedLedger.rows[0];

    if (updatedLedgerData.status === 'paid') {
      const existingAdmitCard = await pool.query(
        'SELECT * FROM admit_cards WHERE student_id = $1 AND semester_number = $2 AND academic_year = $3',
        [student_id, semester_number, academic_year]
      );

      if (existingAdmitCard.rows.length === 0) {
        await pool.query(
          `INSERT INTO admit_cards (student_id, semester_number, academic_year, fee_cleared, status)
           VALUES ($1, $2, $3, true, 'generated')`,
          [student_id, semester_number, academic_year]
        );
      } else {
        await pool.query(
          `UPDATE admit_cards SET fee_cleared = true, status = 'generated'
           WHERE student_id = $1 AND semester_number = $2 AND academic_year = $3`,
          [student_id, semester_number, academic_year]
        );
      }
    }

    res.json({
      message: 'Payment recorded successfully',
      transaction: transaction.rows[0],
      feeLedger: updatedLedgerData,
      excessAddedToWallet: excessAmount > 0 ? excessAmount : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeeStatus = async (req, res) => {
  try {
    const { student_id } = req.params;

    const ledger = await pool.query(
      'SELECT * FROM fee_ledger WHERE student_id = $1 ORDER BY academic_year, semester_number',
      [student_id]
    );

    const wallet = await pool.query(
      'SELECT * FROM student_wallet WHERE student_id = $1',
      [student_id]
    );

    res.json({
      feeLedger: ledger.rows,
      wallet: wallet.rows[0] || { balance: 0 }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const applyWalletToFee = async (req, res) => {
  try {
    const { student_id, semester_number, academic_year } = req.body;

    const wallet = await pool.query(
      'SELECT * FROM student_wallet WHERE student_id = $1',
      [student_id]
    );

    if (!wallet.rows[0] || wallet.rows[0].balance <= 0) {
      return res.status(400).json({ message: 'No wallet balance available' });
    }

    const ledger = await pool.query(
      'SELECT * FROM fee_ledger WHERE student_id = $1 AND semester_number = $2 AND academic_year = $3',
      [student_id, semester_number, academic_year]
    );

    if (ledger.rows.length === 0) {
      return res.status(404).json({ message: 'Fee ledger not found' });
    }

    const balanceDue = ledger.rows[0].total_fee - ledger.rows[0].amount_paid;

    if (balanceDue <= 0) {
      return res.status(400).json({ message: 'Fee already fully paid' });
    }

    const walletBalance = parseFloat(wallet.rows[0].balance);
    const amountToApply = Math.min(walletBalance, balanceDue);

    await pool.query(
      `UPDATE student_wallet SET balance = balance - $1, last_updated = NOW()
       WHERE student_id = $2`,
      [amountToApply, student_id]
    );

    const updatedLedger = await pool.query(
      `UPDATE fee_ledger
       SET amount_paid = amount_paid + $1,
           status = CASE
             WHEN amount_paid + $1 >= total_fee THEN 'paid'
             WHEN amount_paid + $1 > 0 THEN 'partial'
             ELSE 'unpaid'
           END
       WHERE student_id = $2 AND semester_number = $3 AND academic_year = $4
       RETURNING *`,
      [amountToApply, student_id, semester_number, academic_year]
    );

    await pool.query(
      `INSERT INTO transactions (student_id, amount, type, reference_number)
       VALUES ($1, $2, 'wallet_transfer', 'WALLET-APPLY')`,
      [student_id, amountToApply]
    );

    if (updatedLedger.rows[0].status === 'paid') {
      await pool.query(
        `INSERT INTO admit_cards (student_id, semester_number, academic_year, fee_cleared, status)
         VALUES ($1, $2, $3, true, 'generated')
         ON CONFLICT DO NOTHING`,
        [student_id, semester_number, academic_year]
      );
    }

    res.json({
      message: 'Wallet balance applied successfully',
      amountApplied: amountToApply,
      feeLedger: updatedLedger.rows[0],
      remainingWalletBalance: walletBalance - amountToApply
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createFeeLedger, makePayment, getFeeStatus, applyWalletToFee };