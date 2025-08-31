const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Create Sequelize instance for MySQL connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'finance_assistant',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false
  }
);

module.exports = sequelize;