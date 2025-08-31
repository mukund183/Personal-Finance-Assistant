const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile (public route)
router.get('/profile', getUserProfile);

module.exports = router;