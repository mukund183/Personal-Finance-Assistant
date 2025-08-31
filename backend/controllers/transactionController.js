// In-memory transaction storage
let transactions = [];
let nextTransactionId = 1;

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Public
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, userId = 1 } = req.body;
    
    const transaction = {
      id: nextTransactionId++,
      userId: parseInt(userId),
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date: date || new Date().toISOString(),
      receiptImage: req.file ? `/uploads/${req.file.filename}` : null
    };

    transactions.push(transaction);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions for a user with pagination
// @route   GET /api/transactions
// @access  Public
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category, page = 1, limit = 10, userId = 1 } = req.query;
    
    // Filter transactions by user
    let filteredTransactions = transactions.filter(t => t.userId === parseInt(userId));
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (startDate && transactionDate < new Date(startDate)) return false;
        if (endDate && transactionDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Add type filter if provided
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    // Add category filter if provided
    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }
    
    // Sort by date descending
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedTransactions = filteredTransactions.slice(offset, offset + parseInt(limit));
    
    res.json({
      transactions: paginatedTransactions,
      pagination: {
        total: filteredTransactions.length,
        page: parseInt(page),
        pages: Math.ceil(filteredTransactions.length / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Public
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = transactions.find(t => t.id === parseInt(req.params.id));
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Public
exports.updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    
    const transactionIndex = transactions.findIndex(t => t.id === parseInt(req.params.id));
    
    if (transactionIndex === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Update transaction
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      type: type || transactions[transactionIndex].type,
      amount: amount ? parseFloat(amount) : transactions[transactionIndex].amount,
      category: category || transactions[transactionIndex].category,
      description: description || transactions[transactionIndex].description,
      date: date || transactions[transactionIndex].date,
      receiptImage: req.file ? `/uploads/${req.file.filename}` : transactions[transactionIndex].receiptImage
    };
    
    res.json(transactions[transactionIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Public
exports.deleteTransaction = async (req, res) => {
  try {
    const transactionIndex = transactions.findIndex(t => t.id === parseInt(req.params.id));
    
    if (transactionIndex === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    transactions.splice(transactionIndex, 1);
    
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction summary by category
// @route   GET /api/transactions/summary/category
// @access  Public
exports.getTransactionSummaryByCategory = async (req, res) => {
  try {
    const { startDate, endDate, type, userId = 1 } = req.query;
    
    // Filter transactions by user
    let filteredTransactions = transactions.filter(t => t.userId === parseInt(userId));
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (startDate && transactionDate < new Date(startDate)) return false;
        if (endDate && transactionDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Add type filter if provided
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    // Group by category and calculate totals
    const summary = {};
    filteredTransactions.forEach(transaction => {
      if (!summary[transaction.category]) {
        summary[transaction.category] = { total: 0, count: 0 };
      }
      summary[transaction.category].total += transaction.amount;
      summary[transaction.category].count += 1;
    });
    
    // Convert to array format
    const summaryArray = Object.entries(summary).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count
    }));
    
    // Sort by total descending
    summaryArray.sort((a, b) => b.total - a.total);
    
    res.json(summaryArray);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction summary by date
// @route   GET /api/transactions/summary/date
// @access  Public
exports.getTransactionSummaryByDate = async (req, res) => {
  try {
    const { startDate, endDate, type, groupBy = 'day', userId = 1 } = req.query;
    
    // Filter transactions by user
    let filteredTransactions = transactions.filter(t => t.userId === parseInt(userId));
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (startDate && transactionDate < new Date(startDate)) return false;
        if (endDate && transactionDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Add type filter if provided
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    // Group by date
    const summary = {};
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let dateKey;
      
      switch (groupBy) {
        case 'month':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          dateKey = date.getFullYear().toString();
          break;
        case 'day':
        default:
          dateKey = date.toISOString().split('T')[0];
      }
      
      if (!summary[dateKey]) {
        summary[dateKey] = { total: 0, count: 0 };
      }
      summary[dateKey].total += transaction.amount;
      summary[dateKey].count += 1;
    });
    
    // Convert to array format and sort by date
    const summaryArray = Object.entries(summary).map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count
    }));
    
    summaryArray.sort((a, b) => a.date.localeCompare(b.date));
    
    res.json(summaryArray);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};