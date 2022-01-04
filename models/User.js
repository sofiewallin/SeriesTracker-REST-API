const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'A username is required.'],
            minlength: [6, 'The username must have at least 6 characters.'],
            maxlength: [250, 'The username can have a maximum of 250 characters.']
        },
        password: {
            type: String,
            required: [true, 'A password is required.'],
            minlength: [8, 'The password must have at least 8 characters.'],
            maxlength: [1024, 'The password can have a maximum of 1024 characters.']
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);