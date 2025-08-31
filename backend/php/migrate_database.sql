-- Migration script to update existing database schema
-- Run this if you have an existing database with the old column names

USE finance_assistant;

-- Update users table
ALTER TABLE users 
CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update transactions table
ALTER TABLE transactions 
CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update budgets table
ALTER TABLE budgets 
CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update receipts table
ALTER TABLE receipts 
CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Verify the changes
DESCRIBE users;
DESCRIBE transactions;
DESCRIBE budgets;
DESCRIBE receipts; 