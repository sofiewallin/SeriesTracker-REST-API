/**
 * Authorize user middleware.
 * 
 * @author: Sofie Wallin
 */

// dotenv - for enabling use of .env
require('dotenv').config();

// jsonwebtoken - for handling jwt
const jwt = require('jsonwebtoken');

module.exports = function authorizeUser(req, res, next) {
    const loggedInUser = req.user;
    if (loggedInUser.userId !== req.params.id) return res.sendStatus(401);
    
    next();
}