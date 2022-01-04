/**
 * Authentication and user routes.
 * 
 * @author: Sofie Wallin
 */

const router = require('express').Router();

const User = require('../models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* 1. Set routes */

// Register user
router.post('/register', async (req, res) => {
    const usernameExist = await User.findOne({ username: req.body.username });
    if (usernameExist) return res.status(400).json({ message: 'The username is already taken.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        username: req.body.username,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save();
        res.status(201).json({ user: savedUser._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ message: 'The username or password you have entered is invalid.' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'The username or password you have entered is invalid.' });

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

/* 2. Export router */

module.exports = router;
