-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  erp_id VARCHAR(50) UNIQUE NOT NULL,
  roll_number VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  program VARCHAR(100) NOT NULL,
  batch_year INTEGER NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pursuing' CHECK (status IN ('pursuing', 'graduated', 'dropped'))
);