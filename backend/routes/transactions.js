const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  getTransactions, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction,
  getTransactionSummaryByCategory,
  getTransactionSummaryByDate
} = require('../controllers/transactionController');
const multer = require('multer');
const path = require('path');

// Configure multer storage for receipt images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  }
});

// Create transaction with optional receipt image
router.post('/', upload.single('receipt'), createTransaction);

// Get all transactions with filtering and pagination
router.get('/', getTransactions);

// Get transaction by ID
router.get('/:id', getTransactionById);

// Update transaction
router.put('/:id', upload.single('receipt'), updateTransaction);

// Delete transaction
router.delete('/:id', deleteTransaction);

// Get transaction summary by category
router.get('/summary/category', getTransactionSummaryByCategory);

// Get transaction summary by date
router.get('/summary/date', getTransactionSummaryByDate);

module.exports = router;