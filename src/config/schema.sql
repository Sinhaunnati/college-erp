-- Users table
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

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  joining_date DATE
);

-- Fee ledger table
CREATE TABLE IF NOT EXISTS fee_ledger (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  academic_year VARCHAR(10) NOT NULL,
  semester_number INTEGER NOT NULL,
  total_fee DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('paid', 'partial', 'unpaid'))
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('online', 'challan', 'loan', 'concession', 'wallet_transfer')),
  reference_number VARCHAR(100),
  date TIMESTAMP DEFAULT NOW(),
  verified VARCHAR(20) DEFAULT 'pending' CHECK (verified IN ('verified', 'pending', 'unverified'))
);

-- Student wallet table
CREATE TABLE IF NOT EXISTS student_wallet (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Admit cards table
CREATE TABLE IF NOT EXISTS admit_cards (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  semester_number INTEGER NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  fee_cleared BOOLEAN DEFAULT false,
  attendance_eligible BOOLEAN DEFAULT false,
  status VARCHAR(30) DEFAULT 'blocked' CHECK (status IN ('generated', 'blocked', 'manually_overridden')),
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Exceptions table
CREATE TABLE IF NOT EXISTS exceptions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  hod_id INTEGER REFERENCES faculty(id),
  type VARCHAR(30) NOT NULL CHECK (type IN ('fee', 'attendance')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);