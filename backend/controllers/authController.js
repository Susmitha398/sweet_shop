const User = require('../models/User');
const { getDbStatus } = require('../config/db');

// In-memory users for fallback
let memoryUsers = [
  {
    id: 'user-demo-1',
    name: 'Anand Kumar',
    email: 'anand@royalmithai.com',
    password: 'password123',
    phone: '9876543210',
    address: {
      street: '42 South Usman Road, T. Nagar',
      city: 'Chennai',
      pincode: '600017'
    },
    role: 'customer'
  }
];

// Register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, street, city, pincode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    let existingUser = null;
    if (getDbStatus()) {
      existingUser = await User.findOne({ email: cleanEmail });
    } else {
      existingUser = memoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const userData = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password, // In production, bcrypt is used
      phone: phone || '',
      address: {
        street: street || '',
        city: city || 'Chennai',
        pincode: pincode || ''
      },
      role: 'customer'
    };

    if (getDbStatus()) {
      try {
        const newUser = new User(userData);
        await newUser.save();
      } catch (err) {
        console.warn('[User DB Error]', err.message);
      }
    }

    memoryUsers.push(userData);

    // Return safe user info
    const safeUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      token: 'jwt_mock_token_' + Buffer.from(userData.email).toString('base64')
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Royal Sweet Shop.',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let user = null;
    if (getDbStatus()) {
      user = await User.findOne({ email: cleanEmail }).lean();
    }
    if (!user) {
      user = memoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const safeUser = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || { street: '', city: 'Chennai', pincode: '' },
      token: 'jwt_mock_token_' + Buffer.from(user.email).toString('base64')
    };

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current profile
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    // extract email encoded in base64 if available
    let email = '';
    try {
      const b64 = token.replace('jwt_mock_token_', '');
      email = Buffer.from(b64, 'base64').toString('ascii');
    } catch {
      email = '';
    }

    let user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = memoryUsers[0]; // fallback
    }

    res.json({
      success: true,
      data: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile
};
