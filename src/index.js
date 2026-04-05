const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const { verifyToken, verifyRole } = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});