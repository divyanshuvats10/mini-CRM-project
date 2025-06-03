const express = require('express');
const router = express.Router();
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require('../models/user'); // Make sure you have this model

// Redirect-based OAuth (keep this if you want both flows)
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

// POST route for credential verification (for @react-oauth/google)
router.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    console.log('🔐 Attempting Google authentication...');
    console.log('🌐 Request origin:', req.headers.origin);
    console.log('🍪 Incoming cookies:', req.headers.cookie);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log('👤 Google user payload:', payload.name, payload.email);
    
    // Find or create user
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      console.log('👤 Creating new user...');
      user = await User.create({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
      });
    } else {
      console.log('👤 Existing user found');
    }
    
    // Log in the user (set session)
    req.login(user, (err) => {
      if (err) {
        console.error('🚨 Login failed:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      console.log('✅ User logged in successfully:', user.name);
      console.log('🍪 Session ID after login:', req.sessionID);
      
      // Explicitly set CORS headers for this response
      const origin = req.headers.origin;
      if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      
      res.json({ success: true, user });
    });
  } catch (error) {
    console.error('🚨 Google auth error:', error);
    res.status(400).json({ error: 'Invalid credential' });
  }
});

// Alternative: JWT-based authentication
router.post('/auth/google-jwt', async (req, res) => {
  const { credential } = req.body;
  try {
    console.log('🔐 Attempting Google authentication with JWT...');
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log('👤 Google user payload:', payload.name, payload.email);
    
    // Find or create user
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      console.log('👤 Creating new user...');
      user = await User.create({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
      });
    } else {
      console.log('👤 Existing user found');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('✅ User logged in with JWT successfully:', user.name);
    
    res.json({ 
      success: true, 
      user, 
      token,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('🚨 Google auth with JWT error:', error);
    res.status(400).json({ error: 'Invalid credential' });
  }
});

// JWT-based user check
router.get('/auth/user-jwt', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ user: null });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.json({ user: null });
    }
    
    console.log('✅ JWT user verified:', user.name);
    res.json({ user });
  } catch (error) {
    console.error('🚨 JWT verification failed:', error);
    res.json({ user: null });
  }
});

// Check current user session
router.get('/auth/user', (req, res) => {
  console.log('🔍 Checking user session...');
  console.log('🍪 Session ID:', req.sessionID);
  console.log('🔐 Is authenticated:', req.isAuthenticated());
  console.log('👤 User in session:', req.user ? req.user.name : 'None');
  console.log('🌐 Origin:', req.headers.origin);
  console.log('🍪 Cookies received:', req.headers.cookie || 'None');
  console.log('🍪 Raw cookie header:', req.headers.cookie);
  
  // Explicitly set CORS headers for this response
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.isAuthenticated()) {
    console.log('✅ User is authenticated');
    res.json({ user: req.user });
  } else {
    console.log('❌ User is not authenticated');
    res.json({ user: null });
  }
});

// GET logout (for redirect-based flows)
router.get('/auth/logout', (req, res, next) => {
  console.log('🚪 GET logout initiated');
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) { return next(err); }
      res.clearCookie('sessionId');
      console.log('✅ GET logout successful');
      res.redirect('/');
    });
  });
});

// POST logout (for API-based flows)
router.post('/auth/logout', (req, res, next) => {
  console.log('🚪 POST logout initiated');
  console.log('🍪 Session ID:', req.sessionID);
  
  req.logout(function(err) {
    if (err) { 
      console.error('🚨 Logout error:', err);
      return next(err); 
    }
    req.session.destroy((err) => {
      if (err) { 
        console.error('🚨 Session destroy error:', err);
        return next(err); 
      }
      res.clearCookie('sessionId');
      console.log('✅ POST logout successful');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

module.exports = router;
