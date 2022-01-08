/**
 * Routes for authentication.
 * 
 * 1. Set login route
 * 2. Export router
 * 
 * @author: Sofie Wallin
 */

// dotenv - for enabling use of .env
require('dotenv').config();

// Express router
const router = require('express').Router();

// bryptjs - for hashing passwords
const bcrypt = require('bcryptjs');

// jsonwebtoken - for handling jwt
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/User');
 
/**
 * 1. Set login route
 */

router.post('/login', async (req, res) => {
    // Check if username exist
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ message: 'The username or password you have entered is invalid.' });
    
    // Check if password matches username
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'The username or password you have entered is invalid.' });
    
    // Set user for JWT
    const loggedInUser = {
        userId: user._id,
        username: user.username
    }

    // Create JWT with expiration
    const token = jwt.sign(loggedInUser, process.env.TOKEN_SECRET, { expiresIn: '2h' });
    
    // Send JWT
    res.status(200).json({ token: token });
 });
 
/**
 * 2. Export router
 */
 
 module.exports = router;
 