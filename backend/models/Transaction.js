const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  receiptImage: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false
});

// Define association
Transaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = Transaction;