const express = require('express');
const router = express.Router();
const { 
  upload, 
  uploadReceipt, 
  createTransactionFromReceipt, 
  getReceipts, 
  getReceiptById, 
  deleteReceipt 
} = require('../controllers/receiptController');

// Upload receipt
router.post('/upload', upload.single('receipt'), uploadReceipt);

// Create transaction from receipt
router.post('/:id/transaction', createTransactionFromReceipt);

// Get all receipts
router.get('/', getReceipts);

// Get receipt by ID
router.get('/:id', getReceiptById);

// Delete receipt
router.delete('/:id', deleteReceipt);

module.exports = router;