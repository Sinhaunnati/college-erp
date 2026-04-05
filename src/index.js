const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { verifyToken, verifyRole } = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'College ERP API is running' });
});

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, your id is ${req.user.id}` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});