const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');

const Receipt = sequelize.define('Receipt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.ENUM('image', 'pdf'),
    allowNull: false
  },
  extractedData: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  processedTransactionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Transactions',
      key: 'id'
    }
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

// Define associations
Receipt.belongsTo(User, { foreignKey: 'userId' });
Receipt.belongsTo(Transaction, { foreignKey: 'processedTransactionId', as: 'processedTransaction' });

module.exports = Receipt;