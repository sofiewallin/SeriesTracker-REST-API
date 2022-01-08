/**
 * Get user middleware - Gets a user from database by id.
 * 
 * @author: Sofie Wallin
 */

// Models
const User = require('../models/User');

module.exports = async function getUser(req, res, next) {
    let user;

    // Get id from parameter
    const userId = req.params.id;
    try {
        // Get user by id
        user = await User.findById(userId);

        // Send error if there is no users matching the id
        if (user == null) {
            return res.status(404).json({ message: `There is no user with id: ${userId}.` });
        }
    } catch (err) {
        // Send error
        return res.status(500).json({ message: err.message });
    }

    res.user = user;
    next();
}