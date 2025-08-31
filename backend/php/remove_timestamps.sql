-- Migration script to remove timestamp columns
-- Run this if you have an existing database with createdAt/updatedAt columns

USE finance_assistant;

-- Remove timestamp columns from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS createdAt,
DROP COLUMN IF EXISTS updatedAt;

-- Remove timestamp columns from transactions table
ALTER TABLE transactions 
DROP COLUMN IF EXISTS createdAt,
DROP COLUMN IF EXISTS updatedAt;

-- Remove timestamp columns from budgets table
ALTER TABLE budgets 
DROP COLUMN IF EXISTS createdAt,
DROP COLUMN IF EXISTS updatedAt;

-- Remove timestamp columns from receipts table
ALTER TABLE receipts 
DROP COLUMN IF EXISTS createdAt,
DROP COLUMN IF EXISTS updatedAt;

-- Verify the changes
DESCRIBE users;
DESCRIBE transactions;
DESCRIBE budgets;
DESCRIBE receipts; 