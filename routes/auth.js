const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  return token;
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, photoUrl, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Please provide a name and email' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const finalPassword = password || 'defaultPassword123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(finalPassword, salt);
  
    const user = await User.create({
      name,
      email,
      photoUrl: photoUrl || undefined,
      password: hashedPassword,
    });

    if (user) {
      return res.status(201).json({
        message: 'Registration successful! Please login.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          photoUrl: user.photoUrl,
        },
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    generateTokenAndSetCookie(res, user._id);

    return res.json({
      message: 'Login successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/google-login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Missing Google ID token' });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account missing email address' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const dummyPassword = Math.random().toString(36).slice(-10) + 'A1a';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dummyPassword, salt);

      user = await User.create({
        name,
        email,
        photoUrl: picture || undefined,
        password: hashedPassword,
      });
    }

    generateTokenAndSetCookie(res, user._id);

    return res.json({
      message: 'Logged in with Google successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error.message);
    res.status(401).json({ message: 'Invalid Google token verification failed' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('Get Me Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.json({ message: 'Logged out successfully' });
});

module.exports = router;