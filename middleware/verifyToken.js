/**
 * Verify token middleware.
 * 
 * Verifies token and authenticates user.
 * 
 * @author: Sofie Wallin
 */

// dotenv - for enabling use of .env
require('dotenv').config();

// jsonwebtoken - for handling jwt
const jwt = require('jsonwebtoken');

module.exports = function verifyToken(req, res, next) {
    // Get Authorization from headers
    const authHeader = req.headers['authorization'];

    // Get the token from Bearer
    const token = authHeader && authHeader.split(' ')[1];

    // Send error if token doesn't exist
    if(token == null) return res.sendStatus(401);

    try {
        // Verify token
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // Send error
        res.status(403).send('Invalid token.');
    }
}