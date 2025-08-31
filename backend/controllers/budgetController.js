// In-memory budget storage
let budgets = [];
let nextBudgetId = 1;

// Get all budgets for a user
exports.getBudgets = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId) || 1;
    const userBudgets = budgets.filter(b => b.userId === userId);
    
    // Sort by ID descending (newest first)
    userBudgets.sort((a, b) => b.id - a.id);
    
    res.json(userBudgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get a single budget
exports.getBudget = async (req, res) => {
  try {
    const budget = budgets.find(b => b.id === parseInt(req.params.id));
    
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }

    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create a budget
exports.createBudget = async (req, res) => {
  const { category, amount, period, startDate, endDate, notes, userId = 1 } = req.body;

  try {
    const newBudget = {
      id: nextBudgetId++,
      userId: parseInt(userId),
      category,
      amount: parseFloat(amount),
      period: period || 'monthly',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      notes: notes || ''
    };

    budgets.push(newBudget);
    res.json(newBudget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  const { category, amount, period, startDate, endDate, notes } = req.body;

  try {
    const budgetIndex = budgets.findIndex(b => b.id === parseInt(req.params.id));

    if (budgetIndex === -1) {
      return res.status(404).json({ msg: 'Budget not found' });
    }

    // Update budget
    budgets[budgetIndex] = {
      ...budgets[budgetIndex],
      category: category || budgets[budgetIndex].category,
      amount: amount ? parseFloat(amount) : budgets[budgetIndex].amount,
      period: period || budgets[budgetIndex].period,
      startDate: startDate || budgets[budgetIndex].startDate,
      endDate: endDate || budgets[budgetIndex].endDate,
      notes: notes || budgets[budgetIndex].notes
    };

    res.json(budgets[budgetIndex]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budgetIndex = budgets.findIndex(b => b.id === parseInt(req.params.id));

    if (budgetIndex === -1) {
      return res.status(404).json({ msg: 'Budget not found' });
    }

    budgets.splice(budgetIndex, 1);

    res.json({ msg: 'Budget removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get budget vs actual spending
exports.getBudgetComparison = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId) || 1;
    const userBudgets = budgets.filter(b => b.userId === userId);
    
    // Get current date info for filtering
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get all transactions for the current month (from transaction controller)
    // For now, we'll use a simple calculation
    const spendingByCategory = {
      'Food': 250.00,
      'Transportation': 120.50,
      'Entertainment': 80.25,
      'Shopping': 150.75
    };
    
    // Compare budget vs actual
    const comparison = userBudgets.map(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      const remaining = budget.amount - spent;
      const percentUsed = (spent / budget.amount) * 100;
      
      return {
        budgetId: budget.id,
        category: budget.category,
        budgetAmount: budget.amount,
        spent,
        remaining,
        percentUsed: Math.min(percentUsed, 100).toFixed(2)
      };
    });
    
    res.json(comparison);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};