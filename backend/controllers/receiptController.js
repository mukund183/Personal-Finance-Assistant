// In-memory receipt storage
let receipts = [];
let nextReceiptId = 1;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png and .pdf files are allowed'));
  }
};

// Initialize upload
exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Extract relevant data from receipt text (simplified)
const extractReceiptData = (text) => {
  // Simple implementation - in a real app, you'd use OCR
  return {
    amount: Math.random() * 100 + 10, // Random amount for demo
    date: new Date().toISOString(),
    merchant: 'Sample Store',
    rawText: text || 'Receipt data'
  };
};

// @desc    Upload and process receipt
// @route   POST /api/receipts/upload
// @access  Public
exports.uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase() === '.pdf' ? 'pdf' : 'image';
    const userId = parseInt(req.body.userId) || 1;
    
    // Extract data (simplified for demo)
    const extractedData = extractReceiptData('Sample receipt data');
    
    // Create receipt record
    const receipt = {
      id: nextReceiptId++,
      userId,
      filePath: req.file.path,
      fileType,
      extractedData,
      processedTransactionId: null,
      uploadDate: new Date().toISOString()
    };

    receipts.push(receipt);
    
    res.status(201).json({
      receipt,
      extractedData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create transaction from receipt
// @route   POST /api/receipts/:id/transaction
// @access  Public
exports.createTransactionFromReceipt = async (req, res) => {
  try {
    const receipt = receipts.find(r => r.id === parseInt(req.params.id));
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    // Get data from request body, with fallback to extracted data
    const { 
      amount = receipt.extractedData.amount,
      category = 'Uncategorized',
      description = receipt.extractedData.merchant || 'Receipt transaction',
      date = receipt.extractedData.date || new Date().toISOString(),
      userId = receipt.userId
    } = req.body;
    
    // Create transaction (this would normally call the transaction controller)
    const transaction = {
      id: Date.now(), // Simple ID generation
      userId: parseInt(userId),
      type: 'expense',
      amount: parseFloat(amount),
      category,
      description,
      date,
      receiptImage: receipt.filePath.replace('uploads/', '/uploads/')
    };
    
    // Update receipt with transaction reference
    receipt.processedTransactionId = transaction.id;
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all receipts for a user
// @route   GET /api/receipts
// @access  Public
exports.getReceipts = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId) || 1;
    const userReceipts = receipts.filter(r => r.userId === userId);
    
    // Sort by upload date descending
    userReceipts.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    res.json(userReceipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get receipt by ID
// @route   GET /api/receipts/:id
// @access  Public
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = receipts.find(r => r.id === parseInt(req.params.id));
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Public
exports.deleteReceipt = async (req, res) => {
  try {
    const receiptIndex = receipts.findIndex(r => r.id === parseInt(req.params.id));
    
    if (receiptIndex === -1) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    const receipt = receipts[receiptIndex];
    
    // Delete file from filesystem
    if (fs.existsSync(receipt.filePath)) {
      fs.unlinkSync(receipt.filePath);
    }
    
    receipts.splice(receiptIndex, 1);
    
    res.json({ message: 'Receipt removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};