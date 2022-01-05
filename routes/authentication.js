/**
 * Routes for authentication.
 * 
 * 1. Set routes
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
 
/* 1. Set routes */
 
// Register user
router.post('/register', async (req, res) => {
    // Check if username already exists and send error if it does
    const usernameExist = await User.findOne({ username: req.body.username });
    if (usernameExist) return res.status(400).json({ message: 'The username is already taken.' });
    
    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    // Create new user
    const user = new User({
        username: req.body.username,
        password: hashedPassword
    });
 
    try {
        // Save new user
        const newUser = await user.save();

        // Send new users id
        res.status(201).json({ user: newUser._id });
    } catch (err) {
        // Send error
        res.status(400).json({ message: err.message });
    }
});
 
// Login user
router.post('/login', async (req, res) => {
    // Check if username exist and send error if it doesn't
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ message: 'The username or password you have entered is invalid.' });
    
    // Check if password matches username and send error if it doesn't
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'The username or password you have entered is invalid.' });
    
    // Set logged in user for jwt token
    const loggedInUser = {
        userID: user._id,
        username: user.username
    }

    // Create jwt token with userm secret and expiration
    const token = jwt.sign(loggedInUser, process.env.TOKEN_SECRET, { expiresIn: '2h' });
    
    // Send token
    res.status(200).json({ token: token });
 });
 
 /* 2. Export router */
 
 module.exports = router;
 