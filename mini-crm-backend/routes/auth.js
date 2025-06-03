const express = require('express');
const router = express.Router();
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');
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
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // Find or create user
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
      });
    }
    // Log in the user (set session)
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      res.json({ success: true, user });
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid credential' });
  }
});

router.get('/auth/user', (req, res) => {
  res.json({ user: req.user || null });
});


router.get('/auth/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    
    res.redirect('/');
  });
});


module.exports = router;
