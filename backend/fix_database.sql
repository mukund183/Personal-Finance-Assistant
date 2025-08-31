-- Comprehensive database fix script
-- Run this to fix all database schema issues

USE finance_assistant;

-- Drop existing tables if they exist (WARNING: This will delete all data)
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS users;

-- Recreate tables with correct schema (no timestamp columns)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  receiptImage VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period ENUM('monthly', 'quarterly', 'yearly') DEFAULT 'monthly',
  startDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  endDate TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  fileType ENUM('image', 'pdf') NOT NULL,
  extractedData JSON,
  processedTransactionId INT,
  uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (processedTransactionId) REFERENCES transactions(id) ON DELETE SET NULL
);

-- Verify the tables
DESCRIBE users;
DESCRIBE transactions;
DESCRIBE budgets;
DESCRIBE receipts; 