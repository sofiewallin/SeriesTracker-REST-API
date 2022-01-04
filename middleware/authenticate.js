/**
 * Auth
 * 
 * @author: Sofie Wallin
 */

const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
    const token = req.header('auth-token');
    if(!token) return res.status(401).json({ message: 'Access Denied.' });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
    } catch(err) {
        res.status(400).json({ message: 'The token is invalid.' });
    }

    next();
}