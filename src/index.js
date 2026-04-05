const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

require('./config/db');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'College ERP API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});