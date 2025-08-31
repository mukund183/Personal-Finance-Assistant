const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

// @route   GET api/budgets
// @desc    Get all user budgets
// @access  Public
router.get('/', budgetController.getBudgets);

// @route   GET api/budgets/:id
// @desc    Get single budget
// @access  Public
router.get('/:id', budgetController.getBudget);

// @route   POST api/budgets
// @desc    Create a budget
// @access  Public
router.post('/', budgetController.createBudget);

// @route   PUT api/budgets/:id
// @desc    Update a budget
// @access  Public
router.put('/:id', budgetController.updateBudget);

// @route   DELETE api/budgets/:id
// @desc    Delete a budget
// @access  Public
router.delete('/:id', budgetController.deleteBudget);

// @route   GET api/budgets/comparison
// @desc    Get budget vs actual spending comparison
// @access  Public
router.get('/comparison/data', budgetController.getBudgetComparison);

module.exports = router;