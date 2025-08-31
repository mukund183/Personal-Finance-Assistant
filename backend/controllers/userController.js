// In-memory user storage
let users = [];
let nextUserId = 1;

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = users.find(user => 
      user.email === email || user.username === username
    );
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = {
      id: nextUserId++,
      username,
      email,
      password // In a real app, this should be hashed
    };

    users.push(user);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);

    // Check if user exists and password matches
    if (user && user.password === password) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId) || 1; // Default to user 1
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};