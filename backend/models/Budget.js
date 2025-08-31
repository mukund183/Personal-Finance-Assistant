const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Budget = sequelize.define('Budget', {
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
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  period: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
    defaultValue: 'monthly'
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false
});

// Define association
Budget.belongsTo(User, { foreignKey: 'userId' });

module.exports = Budget;